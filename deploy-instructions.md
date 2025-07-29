# Google Cloud Run Deployment Instructions

## Prerequisites
1. Install Google Cloud CLI: https://cloud.google.com/sdk/docs/install
2. Create a Google Cloud project
3. Enable Cloud Run and Container Registry APIs

## Quick Deploy Commands

```bash
# 1. Set your project ID
export PROJECT_ID=alliancedemo
gcloud config set project $PROJECT_ID

# 2. Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 3. Build and deploy (from project root)
gcloud builds submit --tag gcr.io/$PROJECT_ID/alliance-demo

# 4. Deploy to Cloud Run
gcloud run deploy alliance-demo \
  --image gcr.io/$PROJECT_ID/alliance-demo \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 2
```

## Alternative: Manual Docker Build
```bash
# Build locally
docker build -t alliance-demo .

# Tag for Google Container Registry
docker tag alliance-demo gcr.io/alliancedemo/alliance-demo

# Push to registry
docker push gcr.io/alliancedemo/alliance-demo

# Deploy to Cloud Run
gcloud run deploy alliance-demo \
  --image gcr.io/$PROJECT_ID/alliance-demo \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 2
```

## Cost-Optimized Settings
- **Memory**: 512Mi (minimum for React + Node.js)
- **CPU**: 1 (sufficient for demo load)
- **Max instances**: 2 (keeps costs low)
- **Billing**: Pay only when requests come in

Expected cost: ~$1-5/month for light demo usage.

## Accessing Your Demo
After deployment, you'll get a URL like:
`https://alliance-demo-xxxxx-uc.a.run.app`

The app will serve:
- Main demo: `/`
- Display view: `/display`  
- Controller: `/controller`
- Admin panel: `/admin`