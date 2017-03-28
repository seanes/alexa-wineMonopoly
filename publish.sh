rm index.zip
cd lambda
zip ../index.zip -X -r *
cd ..
aws lambda update-function-code --function-name sayHello --zip-file fileb://index.zip
