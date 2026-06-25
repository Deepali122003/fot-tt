from bson import ObjectId

class FacultyModel:
    def __init__(self, db):
        self.collection = db['faculties']

    # -------------------------------
    # CREATE FACULTY
    # -------------------------------
    def create_faculty(self, data):
        faculty = {
            "name": data.get("name"),
            "acronym" : data.get("acronym" , "").strip().upper(),
            "department": data.get("department"),
            "email": data.get("email")
        }
        return self.collection.insert_one(faculty)

    # -------------------------------
    # GET ALL FACULTIES
    # -------------------------------
    def get_all_faculties(self):
        faculties = list(self.collection.find())

        for f in faculties:
            f["_id"] = str(f["_id"])   

        return faculties