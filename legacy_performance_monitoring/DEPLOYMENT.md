# Performance Monitoring System Deployment Guide

## System Architecture

The Performance Monitoring System consists of:
1. React frontend with performance tracking components
2. Express.js API endpoints for data aggregation
3. Redis for persistent metric storage
4. Real-time dashboard visualization

## Prerequisites

- Node.js 16+ and npm
- Redis server (6.0+)
- Environment variables configured (see `.env.example`)
- Access to deployment target (e.g., GitHub Pages, Vercel, or your hosting provider)
- SSL certificate for production deployment

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure environment variables:
- Set appropriate sample rate (`REACT_APP_PERFORMANCE_SAMPLE_RATE`)
- Configure memory tracking based on environment
- Set API key for production deployments
- Configure Redis connection details
- Set rate limiting parameters
- Adjust logging levels as needed

3. Redis Setup:
```bash
# Install Redis (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install redis-server

# Secure Redis (required for production)
sudo nano /etc/redis/redis.conf
# Set requirepass and bind address

# Start Redis service
sudo systemctl start redis
```

## Security Setup

1. Generate API Key:
```bash
# Generate a secure random key
openssl rand -base64 32
```

2. Configure SSL (required for production):
```bash
# Install SSL certificate
sudo certbot --nginx -d your-domain.com
```

3. Set up rate limiting:
- Configure `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS`
- Adjust based on expected traffic

## Build & Deployment

1. Install dependencies:
```bash
npm install
```

2. Build the application:
```bash
npm run build
```

3. Deploy to hosting provider:
```bash
# For GitHub Pages
npm run deploy

# For other providers, follow their specific deployment instructions
```

## Post-Deployment Verification

1. Check Performance Monitoring:
- Visit the dashboard at `/performance`
- Verify metrics are being collected
- Confirm slow component detection works
- Test memory usage tracking

2. Verify API Endpoints:
```bash
# Health check
curl https://your-domain.com/api/performance/health

# Get all metrics (with API key)
curl -H "x-api-key: your-api-key" https://your-domain.com/api/performance/metrics

# Get slow components
curl -H "x-api-key: your-api-key" https://your-domain.com/api/performance/slow-components

# Get configuration
curl -H "x-api-key: your-api-key" https://your-domain.com/api/performance/config
```

3. Monitor Logs:
- Check server logs for any errors
- Verify performance logging is working
- Monitor memory usage patterns
- Check Redis connection status

## Security Verification

1. API Security:
- Verify API key validation
- Test rate limiting
- Confirm HTTPS enforcement
- Check CORS settings

2. Data Privacy:
- Verify sensitive data is not exposed
- Confirm Redis password is working
- Test data cleanup functionality

3. Resource Management:
- Monitor Redis memory usage
- Check metric retention
- Verify cleanup processes

## Monitoring & Maintenance

1. Health Monitoring:
```bash
# Set up monitoring for the health endpoint
watch -n 60 'curl https://your-domain.com/api/performance/health'

# Monitor Redis
redis-cli -a your-redis-password info | grep used_memory_human
```

2. Backup Procedures:
```bash
# Backup Redis data
redis-cli -a your-redis-password save
cp /var/lib/redis/dump.rdb /backup/redis-backup-$(date +%Y%m%d).rdb
```

3. Regular Maintenance:
- Review and rotate logs
- Update SSL certificates
- Check for dependency updates
- Monitor disk usage

## Troubleshooting

1. Performance Issues:
- Check Redis connection pool
- Monitor API response times
- Review rate limiting logs

2. API Issues:
- Verify Redis connectivity
- Check API key configuration
- Review CORS settings

3. Dashboard Issues:
- Clear browser cache
- Check WebSocket connections
- Verify data refresh rate

## Support

For issues or questions:
1. Check the troubleshooting guide
2. Review GitHub issues
3. Contact support team

## License

This project is licensed under the MIT License - see the LICENSE file for details. 