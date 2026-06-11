from bson import ObjectId

class LabModel:
    def __init__(self, db):
        # Storing labs in a separate collection as requested
        self.collection = db['labs']

    def get_all_labs(self):
        """Fetches all registered laboratory rooms."""
        labs = list(self.collection.find())
        for l in labs:
            l['_id'] = str(l['_id'])
        return labs

    def create_lab(self, lab_name, capacity, lab_type, building="Science Block"):
        """
        Adds a new lab to the database.
        :param lab_name: Name/Number of the lab (e.g., 'Computer Lab 1')
        :param capacity: Maximum number of students
        :param lab_type: Type of lab (e.g., 'Physics', 'CSE', 'Mechanical')
        :param building: Physical location of the lab
        """
        lab_data = {
            "lab_name": lab_name,
            "capacity": capacity,
            "lab_type": lab_type,
            "building": building
        }
        return self.collection.insert_one(lab_data)

    def search_labs_by_type(self, lab_type):
        """Filters labs based on the department or subject type."""
        return list(self.collection.find({"lab_type": {"$regex": lab_type, "$options": "i"}}))