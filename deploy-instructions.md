## notes for deployment
- gcloud builds submit . --tag gcr.io/alliancedemo/alliance-demo
- gcloud run deploy alliance-demo --image gcr.io/alliancedemo/alliance-demo --platform managed --region us-central1 --allow-unauthenticated --memory 512Mi --cpu 1 --max-instances 2

- new test
- gcloud run deploy alliance-demo --image gcr.io/alliancedemo/alliance-demo --platform managed --region us-central1 --allow-unauthenticated --memory 1Gi --cpu 2 --max-instances 3 --timeout 900 --concurrency 80 --port 8080

- gcloud auth login rjbulcher@gmail.com
- gcloud config set project alliancedemo