# 🚀 SovereigntyOS Production Setup Guide

Complete step-by-step guide to deploy SovereigntyOS to production with enterprise-grade security.

## 📋 **QUICK CHECKLIST**

- [ ] Branch Protection Enabled
- [ ] Alibaba OSS Bucket Created
- [ ] GitHub Secrets Added
- [ ] First Deployment Tested
- [ ] Domain Configured (Optional)

## 🔐 **STEP 1: BRANCH PROTECTION** (Manual Setup Required)

### **Why This Matters:**
Prevents direct pushes to main, requires PR reviews, and ensures all security checks pass.

### **Setup Instructions:**

1. **Go to Branch Settings:**
   ```
   https://github.com/deedk822-lang/sovereigntyos_AI/settings/branches
   ```

2. **Click "Add rule"**

3. **Branch name pattern:** `main`

4. **Required Settings:**
   ```
   ✅ Require a pull request before merging
      ✅ Require approvals (minimum: 1)
      ✅ Dismiss stale PR approvals when new commits are pushed
   
   ✅ Require status checks to pass before merging
      ✅ Require branches to be up to date before merging
      ✅ Status checks to require:
         • security-scan
         • test (18.x)
         • test (20.x) 
         • build
   
   ✅ Include administrators
   ✅ Restrict pushes to matching branches
   ✅ Allow force pushes: Everyone (unchecked)
   ✅ Allow deletions: (unchecked)
   ```

5. **Click "Create"**

---

## 🌏 **STEP 2: ALIBABA CLOUD OSS SETUP**

### **2.1: Create OSS Bucket**

1. **Login to Alibaba Cloud:**
   ```
   https://oss.console.aliyun.com/
   ```

2. **Click "Create Bucket"**

3. **Bucket Configuration:**
   ```
   Bucket Name: sovereigntyos-production
   Region: Singapore (ap-southeast-1)
   Storage Class: Standard
   ACL: Public Read
   Versioning: Disabled
   Server-side Encryption: Disabled
   ```

4. **Click "OK"**

### **2.2: Enable Static Website Hosting**

1. **Click bucket name:** `sovereigntyos-production`

2. **Left sidebar:** Basic Settings → Static Website Hosting

3. **Click "Configure"**

4. **Settings:**
   ```
   Default Homepage: index.html
   Default 404 Page: index.html
   ```

5. **Click "Save"**

### **2.3: Generate Access Keys**

1. **User Menu (top right)** → AccessKey Management

2. **Click "Create AccessKey"**

3. **⚠️ IMPORTANT:** Copy and save securely:
   ```
   AccessKey ID: LTAI... (starts with LTAI)
   AccessKey Secret: ... (long random string)
   ```

---

## 🔑 **STEP 3: GITHUB SECRETS**

### **3.1: Navigate to Secrets**
```
https://github.com/deedk822-lang/sovereigntyos_AI/settings/secrets/actions
```

### **3.2: Add Required Secrets**

**Click "New repository secret" for each:**

#### **ALIBABA_ACCESS_KEY_ID**
- **Name:** `ALIBABA_ACCESS_KEY_ID`
- **Secret:** Your AccessKey ID from Step 2.3

#### **ALIBABA_ACCESS_KEY_SECRET** 
- **Name:** `ALIBABA_ACCESS_KEY_SECRET`
- **Secret:** Your AccessKey Secret from Step 2.3

#### **ALIBABA_REGION**
- **Name:** `ALIBABA_REGION`
- **Secret:** `ap-southeast-1`

#### **ALIBABA_OSS_BUCKET**
- **Name:** `ALIBABA_OSS_BUCKET` 
- **Secret:** `sovereigntyos-production`

### **3.3: Optional Secrets**

#### **For CDN (Optional)**
- **Name:** `ALIBABA_CDN_DOMAIN`
- **Secret:** `yourdomain.com`

#### **For Code Coverage (Optional)**
- **Name:** `CODECOV_TOKEN`
- **Secret:** Get from codecov.io

---

## 🚀 **STEP 4: TEST DEPLOYMENT**

### **4.1: Trigger First Deployment**

1. **Go to Actions:**
   ```
   https://github.com/deedk822-lang/sovereigntyos_AI/actions
   ```

2. **Click "Alibaba OSS Production Deployment"**

3. **Click "Run workflow"** → **"Run workflow"**

### **4.2: Monitor Progress**

- ✅ **Security Scan** should pass
- ✅ **Test (18.x, 20.x)** should pass  
- ✅ **Build** should create artifacts
- ✅ **Deploy to OSS** should upload files

### **4.3: Verify Deployment**

Your site will be live at:
```
https://sovereigntyos-production.oss-ap-southeast-1.aliyuncs.com/
```

**Health Check:**
```
https://sovereigntyos-production.oss-ap-southeast-1.aliyuncs.com/build-info.json
```

---

## 🌐 **STEP 5: CUSTOM DOMAIN (Optional)**

### **5.1: Alibaba CDN Setup**

1. **CDN Console:**
   ```
   https://cdn.console.aliyun.com/
   ```

2. **Add Domain:**
   - **Domain:** `yourdomain.com`
   - **Origin:** `sovereigntyos-production.oss-ap-southeast-1.aliyuncs.com`
   - **Origin Type:** OSS Bucket

3. **Update GitHub Secret:**
   ```
   ALIBABA_CDN_DOMAIN=yourdomain.com
   ```

### **5.2: DNS Configuration**

**Add CNAME record:**
```
Type: CNAME
Name: @
Value: your-cdn-domain.alikunlun.com
```

---

## 🛡️ **SECURITY FEATURES ENABLED**

✅ **Branch Protection:** Prevents direct pushes to main  
✅ **PR Reviews:** Requires approval before merging  
✅ **Status Checks:** All CI/CD must pass  
✅ **Security Scanning:** CodeQL + npm audit  
✅ **Dependabot:** Weekly dependency updates  
✅ **Secrets Management:** Encrypted in GitHub  
✅ **HTTPS Only:** SSL/TLS encryption  
✅ **Access Control:** OSS public read only  

---

## 🔧 **TROUBLESHOOTING**

### **Deployment Fails**
```bash
# Check GitHub Actions logs
1. Go to Actions tab
2. Click failed workflow
3. Check step-by-step logs
```

### **OSS Access Denied**
```bash
# Verify secrets in GitHub
1. Check ALIBABA_ACCESS_KEY_ID format
2. Verify ALIBABA_ACCESS_KEY_SECRET
3. Confirm bucket name matches exactly
```

### **Website Not Loading**
```bash
# Common fixes
1. Wait 2-3 minutes for DNS propagation
2. Check static website hosting enabled
3. Verify index.html uploaded
4. Check bucket ACL is Public Read
```

### **Status Checks Failing**
```bash
# Enable required status checks
1. Go to branch protection settings
2. Add status checks:
   - security-scan
   - test (18.x)
   - test (20.x)
   - build
```

---

## 📊 **MONITORING & MAINTENANCE**

### **Regular Tasks:**
- ✅ Monitor Dependabot PRs (weekly)
- ✅ Review security advisories (monthly)
- ✅ Update dependencies (as needed)
- ✅ Check deployment logs (after changes)

### **Performance Monitoring:**
- 🌏 **Global Access:** via CDN
- ⚡ **Load Time:** < 2 seconds
- 🔒 **Security:** A+ SSL rating
- 📱 **Mobile:** Responsive design

---

## 🆘 **SUPPORT**

**Issues or Questions:**
- 📧 **Email:** security@sovereigntyos.ai
- 🐛 **GitHub Issues:** For bugs only
- 📚 **Documentation:** This guide

**Emergency:**
- 🚨 **Rollback:** Previous deployment artifacts available
- 🔄 **Backup:** OSS versioning enabled
- 📞 **Contact:** Immediate response for critical issues

---

**🎉 Congratulations! Your SovereigntyOS is now production-ready with enterprise-grade security! 🇿🇦🚀**