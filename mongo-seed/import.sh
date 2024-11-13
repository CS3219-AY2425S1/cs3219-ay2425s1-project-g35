if [ -f /seed_set/seeded ]; then
    echo "MongoDB already seeded"
else
    touch /seed_set/seeded
    echo "Seeding MongoDB"
    mongoimport --host mongo:27017 --authenticationDatabase=admin --username root --password example --db questions --collection questions --type csv --file /mongo-seed/sample_questions.csv --headerline
fi
