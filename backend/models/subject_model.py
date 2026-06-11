class SubjectModel:
    def __init__(self, db):
        self.collection = db['subjects']

    def create_subject(self, code, title, credits):
        subject_data = {
            "code": code,
            "title": title,
            "credits": credits
        }
        return self.collection.insert_one(subject_data)

    def search_subjects(self, query):
        """Useful for an autocomplete subject field in the UI."""
        return list(self.collection.find({"title": {"$regex": query, "$options": "i"}}))