import cluster from 'cluster';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { pathToFileURL } from 'url';
import net from 'net';
import { PORT } from './config/config.js';

const numCPUs = os.cpus().length;
const RESTART_DELAY = 1000; // 1 second delay between restarts
const MAX_RESTARTS = 5; // Maximum number of restarts per minute
let restartCount = 0;
let lastRestartTime = Date.now();

class ClusterService {
    static async init() {
        if (cluster.isPrimary) {
            process.title = 'node-primary';
            console.log('🚀 Primary Process:', process.pid);

            // Check if port is available before starting workers
            const testServer = net.createServer();
            try {
                await new Promise((resolve, reject) => {
                    testServer.once('error', (err) => {
                        if (err.code === 'EADDRINUSE') {
                            reject(new Error(`Port ${PORT} is already in use`));
                        } else {
                            reject(err);
                        }
                    });
                    testServer.once('listening', () => {
                        testServer.close();
                        resolve();
                    });
                    testServer.listen(PORT);
                });
            } catch (error) {
                console.error('❌ Error:', error.message);
                process.exit(1);
            }

            // Enable clustering features
            cluster.setupPrimary({
                windowsHide: true,
                schedulingPolicy: cluster.SCHED_RR, // Round-robin scheduling
                serialization: 'advanced'
            });

            const workerCount = Math.min(numCPUs, 4); // Limit to max 4 workers or CPU count
            console.log(`⚙️  Setting up ${workerCount} workers...`);

            // Create initial worker pool
            for (let i = 0; i < workerCount; i++) {
                await ClusterService.createWorker();
            }

            // Handle worker exits
            cluster.on('exit', async (worker, code, signal) => {
                const now = Date.now();

                // Reset restart count if more than a minute has passed
                if (now - lastRestartTime > 60000) {
                    restartCount = 0;
                    lastRestartTime = now;
                }

                console.log(`⚠️  Worker ${worker.process.pid} died (${signal || code})`);

                // Check restart limits
                if (restartCount < MAX_RESTARTS) {
                    restartCount++;
                    setTimeout(async () => {
                        await ClusterService.createWorker();
                    }, RESTART_DELAY);
                } else {
                    console.error('❌ Too many worker restarts in short period. Please check for critical errors.');
                    await ClusterService.shutdown();
                }
            });

            // Monitor system resources
            const monitorInterval = setInterval(() => {
                const usage = process.memoryUsage();
                const activeWorkers = Object.keys(cluster.workers).length;

                console.log('📊 System Status:');
                console.log(`   - Heap Used: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
                console.log(`   - Total Memory: ${Math.round(usage.rss / 1024 / 1024)}MB`);
                console.log(`   - Active Workers: ${activeWorkers}`);

                // Auto-scale if needed
                if (activeWorkers < workerCount) {
                    console.log('⚠️  Worker count below target, scaling up...');
                    ClusterService.createWorker();
                }
            }, 30000);

            // Handle process signals
            process.on('SIGTERM', async () => {
                clearInterval(monitorInterval);
                await ClusterService.shutdown();
            });
            process.on('SIGINT', async () => {
                clearInterval(monitorInterval);
                await ClusterService.shutdown();
            });

        } else {
            process.title = `node-worker-${process.pid}`;

            try {
                // Get the server file path using proper URL formatting
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = dirname(__filename);
                const serverPath = path.join(__dirname, 'server.js');

                // Convert the path to a file URL (required for Windows ESM)
                const serverUrl = pathToFileURL(serverPath).href;

                // Set worker-specific environment variables
                process.env.NODE_WORKER_ID = cluster.worker.id.toString();

                // Import and start the server using the file URL
                const { default: startServer } = await import(serverUrl);

                // Handle uncaught errors in worker
                process.on('uncaughtException', (err) => {
                    console.error(`🔥 Worker ${process.pid} uncaught exception:`, err);
                    process.exit(1);
                });

                process.on('unhandledRejection', (reason, promise) => {
                    console.error(`🔥 Worker ${process.pid} unhandled rejection:`, reason);
                    process.exit(1);
                });

                await startServer();

            } catch (error) {
                console.error(`❌ Worker ${process.pid} failed to start:`, error);
                process.exit(1);
            }
        }
    }

    static async createWorker() {
        return new Promise((resolve) => {
            const worker = cluster.fork();

            worker.once('online', () => {
                console.log(`✅ Worker ${worker.process.pid} is online`);
                resolve(worker);
            });

            worker.on('error', (error) => {
                console.error(`❌ Worker ${worker.process.pid} error:`, error);
            });

            // Set up IPC communication
            worker.on('message', (msg) => {
                if (msg.type === 'status') {
                    worker.lastStatus = msg.data;
                }
            });
        });
    }

    static async shutdown() {
        console.log('🛑 Graceful shutdown initiated...');

        // Notify all workers to stop accepting new connections
        const workers = Object.values(cluster.workers);

        // Send shutdown signal to all workers
        workers.forEach(worker => worker.send('shutdown'));

        // Wait for all workers to exit (max 5 seconds)
        try {
            await Promise.race([
                Promise.all(workers.map(worker =>
                    new Promise(resolve => worker.once('exit', resolve))
                )),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Shutdown timeout')), 5000))
            ]);
            console.log('✅ All workers shut down successfully');
        } catch (error) {
            console.error('⚠️ Force shutting down remaining workers');
            workers.forEach(worker => worker.kill());
        }

        console.log('💤 Cluster shutdown complete');
        process.exit(0);
    }
}

export default ClusterService; 