# Production Deployment Checklist

## Pre-Deployment
- [ ] All tests passing
- [ ] Security audit completed (npm audit high+)
- [ ] Code review completed
- [ ] Branch protection enabled on main
- [ ] Environment variables configured (GitHub Secrets)
- [ ] Database migrations tested (if applicable)

## Deployment
- [ ] Backup current deployment (scripts/backup.sh)
- [ ] Deploy to staging environment
- [ ] Run integration tests on staging
- [ ] Deploy to production
- [ ] Verify health checks and dashboards
- [ ] Monitor error rates

## Post-Deployment
- [ ] Verify all services running
- [ ] Test critical user journeys
- [ ] Update documentation
- [ ] Tag release
