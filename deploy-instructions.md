## notes for deployment
- gcloud builds submit . --tag gcr.io/alliancedemo/alliance-demo
- gcloud run deploy alliance-demo --image gcr.io/alliancedemo/alliance-demo --platform managed --region us-central1 --allow-unauthenticated --memory 512Mi --cpu 1 --max-instances 2