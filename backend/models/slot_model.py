from bson import ObjectId

class SlotModel:
    def __init__(self, db):
        self.collection = db['slots']

    TIMES = ["8-9","9-10","10-11","11-12","12-1","1-2","2-3","3-4","4-5","5-6"]

    def get_occupied_times(self, slot_data):
        """Returns list of times this slot occupies based on duration."""
        times = self.TIMES
        start = slot_data.get("time")
        duration = int(slot_data.get("duration", 1))
        if start not in times:
            return [start]
        idx = times.index(start)
        return [times[i] for i in range(idx, min(idx + duration, len(times)))]

    def check_conflicts(self, slot_data, exclude_id=None):
        occupied_times = self.get_occupied_times(slot_data)
        
        faculty_conflict = None
        room_conflict = None
        lab_conflict = None

        for time in occupied_times:
            base_query = {
                "day": slot_data['day'],
                "$or": [
                    {"time": time},
                    # also check if existing 2hr slot overlaps
                    {"time": time, "duration": {"$gt": 1}}
                ]
            }

            if exclude_id:
                if isinstance(exclude_id, str):
                    exclude_id = ObjectId(exclude_id)
                base_query["_id"] = {"$ne": exclude_id}

            if slot_data.get("faculty") and not faculty_conflict:
                query = {**base_query, "faculty": slot_data["faculty"]}
                faculty_conflict = self.collection.find_one(query)

            if slot_data.get("room_number") and not room_conflict:
                query = {**base_query, "room_number": slot_data["room_number"]}
                room_conflict = self.collection.find_one(query)

            if slot_data.get("lab_name") and not lab_conflict:
                query = {**base_query, "lab_name": slot_data["lab_name"]}
                lab_conflict = self.collection.find_one(query)

        return faculty_conflict, room_conflict, lab_conflict

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

    def delete_slot(self, slot_id):
        return self.collection.delete_one({"_id": ObjectId(slot_id)})

    def get_slots_by_batch(self, batch_name):
        return list(self.collection.find({"batch": batch_name}))

    def get_slots_by_faculty(self, faculty_name):
        return list(self.collection.find({"faculty": faculty_name}))

    def get_slots_by_room(self, room_number):
        return list(self.collection.find({"room_number": room_number}))