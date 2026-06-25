from bson import ObjectId

class SlotModel:
    def __init__(self, db):
        self.collection = db['slots']

    # ----------------------------------------
    # Conflict Detection (FIXED)
    # ----------------------------------------
    def check_conflicts(self, slot_data, exclude_id=None):
        base_query = {
            "day": slot_data['day'],
            "time": slot_data['time']
        }

        if exclude_id:
            if isinstance(exclude_id, str):
                exclude_id = ObjectId(exclude_id)
            base_query["_id"] = {"$ne": exclude_id}

        # ✅ Faculty Conflict (FIXED)
        faculty_conflict = None
        if slot_data.get("faculty"):
            query = base_query.copy()
            query["faculty"] = slot_data["faculty"]
            faculty_conflict = self.collection.find_one(query)

        # ✅ Room Conflict (FIXED)
        room_conflict = None
        if slot_data.get("room_number"):
            query = base_query.copy()
            query["room_number"] = slot_data["room_number"]
            room_conflict = self.collection.find_one(query)

        # ✅ Lab Conflict (optional)
        lab_conflict = None
        if slot_data.get("lab_name"):
            query = base_query.copy()
            query["lab_name"] = slot_data["lab_name"]
            lab_conflict = self.collection.find_one(query)

        return faculty_conflict, room_conflict, lab_conflict

    # ----------------------------------------
    # Create Slot
    # ----------------------------------------
    def create_slot(self, slot_data):
        f_conf, r_conf, l_conf = self.check_conflicts(slot_data)

        if f_conf or r_conf or l_conf:
            return {
                "error": "Conflict detected",
                "faculty_conflict": bool(f_conf),
                "room_conflict": bool(r_conf),
                "lab_conflict": bool(l_conf)
            }

        return self.collection.insert_one(slot_data)

    # ----------------------------------------
    # Update Slot
    # ----------------------------------------
    def update_slot(self, slot_id, slot_data):
        f_conf, r_conf, l_conf = self.check_conflicts(slot_data, exclude_id=slot_id)

        if f_conf or r_conf or l_conf:
            return {
                "error": "Conflict detected",
                "faculty_conflict": bool(f_conf),
                "room_conflict": bool(r_conf),
                "lab_conflict": bool(l_conf)
            }

        return self.collection.update_one(
            {"_id": ObjectId(slot_id)},
            {"$set": slot_data}
        )

    # ----------------------------------------
    # Delete Slot
    # ----------------------------------------
    def delete_slot(self, slot_id):
        return self.collection.delete_one({"_id": ObjectId(slot_id)})

    # ----------------------------------------
    # Fetch by Batch
    # ----------------------------------------
    def get_slots_by_batch(self, batch_name):
        return list(self.collection.find({"batch": batch_name}))

    # ----------------------------------------
    # Fetch by Faculty
    # ----------------------------------------
    def get_slots_by_faculty(self, faculty_name):
        return list(self.collection.find({"faculty": faculty_name}))

    # ----------------------------------------
    # Fetch by Room
    # ----------------------------------------
    def get_slots_by_room(self, room_number):
        return list(self.collection.find({"room_number": room_number}))