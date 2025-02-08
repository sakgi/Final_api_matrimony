const express = require('express');
const os = require('os');
const { uptime, memoryUsage, cpuUsage } = require('process');
const router = express.Router();

router.get('/', (req, res) => {
    const serverInfo = {
        status: 'Running...',
        health: 'Good',
        uptime: `${(process.uptime().toFixed(2))} seconds`,
        platform: os.platform(),
        architecture: os.arch(),
        memoryUsage: `${(process.memoryUsage().rss / 1024 /1024).toFixed(2)} MB`,
        cpuUsage: `${(os.loadavg()[0]).toFixed(2)}%`,
        freeMemory: `${(os.freemem() / 1024 / 1024).toFixed(2)} MB`,
        totalMemory: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
        cpus: os.cpus().map(cpu => cpu.model),
    };
    res.status(200).json(serverInfo);
});

module.exports = router;