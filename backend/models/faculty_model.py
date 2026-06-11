# from bson import ObjectId

# class FacultyModel:
#     def __init__(self, db):
#         self.collection = db['faculties']

#     def get_all(self):
#         """Returns all faculty members for dropdowns in EditSlotModal."""
#         faculties = list(self.collection.find())
#         for f in faculties:
#             f['_id'] = str(f['_id'])
#         return faculties

#     def create_faculty(self, name, department, email):
#         """Adds a new faculty member to the database."""
#         faculty_data = {
#             "name": name,
#             "department": department,
#             "email": email
#         }
#         return self.collection.insert_one(faculty_data)


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
            f["_id"] = str(f["_id"])   # ✅ IMPORTANT FIX

        return faculties