from bson import ObjectId

class SubjectModel:
    def __init__(self, db):
        self.collection = db['subjects']

    def create_subject(self, data):
        subject_data = {
            "code": data.get("code", "").strip().upper(),
            "title": data.get("title", "").strip()
        }
        return self.collection.insert_one(subject_data)

    def get_all_subjects(self):
        subjects = list(self.collection.find())
        for s in subjects:
            s["_id"] = str(s["_id"])
        return sorted(subjects, key=lambda x: x.get("title", "").lower())

    def search_subjects(self, query):
        results = list(self.collection.find({
            "$or": [
                {"title": {"$regex": query, "$options": "i"}},
                {"code": {"$regex": query, "$options": "i"}}
            ]
        }))
        for s in results:
            s["_id"] = str(s["_id"])
        return results

    def delete_subject(self, subject_id):
        return self.collection.delete_one({"_id": ObjectId(subject_id)})