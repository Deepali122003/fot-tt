# from bson import ObjectId

# class SlotModel:
#     def __init__(self, db):
#         self.collection = db['slots']

#     # ----------------------------------------
#     # 🔍 Conflict Detection
#     # ----------------------------------------
#     def check_conflicts(self, slot_data, exclude_id=None):
#         base_query = {
#             "day": slot_data['day'],
#             "time": slot_data['time']
#         }

#         # Ignore current slot during update
#         if exclude_id:
#             if isinstance(exclude_id, str):
#                 exclude_id = ObjectId(exclude_id)
#             base_query["_id"] = {"$ne": exclude_id}

#         # Faculty conflict
#         faculty_conflict = None
#         if slot_data.get("faculty_id"):
#             faculty_query = base_query.copy()
#             faculty_query["faculty_id"] = slot_data["faculty_id"]
#             faculty_conflict = self.collection.find_one(faculty_query)

#         # Room conflict
#         room_conflict = None
#         if slot_data.get("room_id"):
#             room_query = base_query.copy()
#             room_query["room_id"] = slot_data["room_id"]
#             room_conflict = self.collection.find_one(room_query)

#         # Lab conflict
#         lab_conflict = None
#         if slot_data.get("lab_id"):
#             lab_query = base_query.copy()
#             lab_query["lab_id"] = slot_data["lab_id"]
#             lab_conflict = self.collection.find_one(lab_query)

#         return faculty_conflict, room_conflict, lab_conflict


#     # ----------------------------------------
#     # ➕ Create Slot
#     # ----------------------------------------
#     def create_slot(self, slot_data):
#         f_conf, r_conf, l_conf = self.check_conflicts(slot_data)

#         if f_conf or r_conf or l_conf:
#             return {
#                 "error": "Conflict detected",
#                 "faculty_conflict": bool(f_conf),
#                 "room_conflict": bool(r_conf),
#                 "lab_conflict": bool(l_conf)
#             }

#         return self.collection.insert_one(slot_data)


#     # ----------------------------------------
#     # ✏️ Update Slot
#     # ----------------------------------------
#     def update_slot(self, slot_id, slot_data):
#         f_conf, r_conf, l_conf = self.check_conflicts(slot_data, exclude_id=slot_id)

#         if f_conf or r_conf or l_conf:
#             return {
#                 "error": "Conflict detected",
#                 "faculty_conflict": bool(f_conf),
#                 "room_conflict": bool(r_conf),
#                 "lab_conflict": bool(l_conf)
#             }

#         return self.collection.update_one(
#             {"_id": ObjectId(slot_id)},
#             {"$set": slot_data}
#         )


#     # ----------------------------------------
#     # ❌ Delete Slot
#     # ----------------------------------------
#     def delete_slot(self, slot_id):
#         return self.collection.delete_one({"_id": ObjectId(slot_id)})


#     # ----------------------------------------
#     # 📊 Fetch by Batch (FIXED)
#     # ----------------------------------------
#     def get_slots_by_batch(self, batch_name):
#         """
#         IMPORTANT:
#         We use batch NAME because frontend sends name (CSE-1),
#         not ObjectId.
#         """
#         return list(self.collection.find({
#             "batch": batch_name
#         }))


#     # ----------------------------------------
#     # 👨‍🏫 Fetch by Faculty
#     # ----------------------------------------
#     def get_slots_by_faculty(self, faculty_name):
#         return list(self.collection.find({
#             "faculty": faculty_name
#         }))


#     # ----------------------------------------
#     # 🏫 Fetch by Room
#     # ----------------------------------------
#     def get_slots_by_room(self, room_number):
#         return list(self.collection.find({
#             "room_number": room_number
#         }))
# # from bson import ObjectId

# # class SlotModel:
# #     def __init__(self, db):
# #         self.collection = db['slots']

# #     def check_conflicts(self, slot_data, exclude_id=None):
# #         """
# #         Checks conflicts for:
# #         - Faculty
# #         - Room
# #         - Lab
# #         """

# #         base_query = {
# #             "day": slot_data['day'],
# #             "time": slot_data['time']
# #         }

# #         # Ignore current slot during update
# #         if exclude_id:
# #             if isinstance(exclude_id, str):
# #                 exclude_id = ObjectId(exclude_id)
# #             base_query["_id"] = {"$ne": exclude_id}

# #         # 1️⃣ Faculty conflict
# #         faculty_conflict = None
# #         if slot_data.get("faculty_id"):
# #             faculty_query = base_query.copy()
# #             faculty_query["faculty_id"] = slot_data["faculty_id"]
# #             faculty_conflict = self.collection.find_one(faculty_query)

# #         # 2️⃣ Room conflict
# #         room_conflict = None
# #         if slot_data.get("room_id"):
# #             room_query = base_query.copy()
# #             room_query["room_id"] = slot_data["room_id"]
# #             room_conflict = self.collection.find_one(room_query)

# #         # 3️⃣ Lab conflict
# #         lab_conflict = None
# #         if slot_data.get("lab_id"):
# #             lab_query = base_query.copy()
# #             lab_query["lab_id"] = slot_data["lab_id"]
# #             lab_conflict = self.collection.find_one(lab_query)

# #         return faculty_conflict, room_conflict, lab_conflict


# #     def create_slot(self, slot_data):
# #         f_conf, r_conf, l_conf = self.check_conflicts(slot_data)

# #         if f_conf or r_conf or l_conf:
# #             return {
# #                 "error": "Conflict detected",
# #                 "faculty_conflict": bool(f_conf),
# #                 "room_conflict": bool(r_conf),
# #                 "lab_conflict": bool(l_conf)
# #             }

# #         return self.collection.insert_one(slot_data)


# #     def update_slot(self, slot_id, slot_data):
# #         f_conf, r_conf, l_conf = self.check_conflicts(slot_data, exclude_id=slot_id)

# #         if f_conf or r_conf or l_conf:
# #             return {
# #                 "error": "Conflict detected",
# #                 "faculty_conflict": bool(f_conf),
# #                 "room_conflict": bool(r_conf),
# #                 "lab_conflict": bool(l_conf)
# #             }

# #         return self.collection.update_one(
# #             {"_id": ObjectId(slot_id)},
# #             {"$set": slot_data}
# #         )


# #     def delete_slot(self, slot_id):
# #         return self.collection.delete_one({"_id": ObjectId(slot_id)})


# #     # ✅ IMPORTANT: use batch_id instead of batch name
# #     def get_slots_by_batch(self, batch_id):
# #         if isinstance(batch_id, str):
# #             batch_id = ObjectId(batch_id)

# #         return list(self.collection.find({"batch_id": batch_id}))


# #     # ✅ NEW: filtering for faculty page
# #     def get_slots_by_faculty(self, faculty_id):
# #         if isinstance(faculty_id, str):
# #             faculty_id = ObjectId(faculty_id)

# #         return list(self.collection.find({"faculty_id": faculty_id}))


# #     # ✅ NEW: filtering for room page
# #     def get_slots_by_room(self, room_id):
# #         if isinstance(room_id, str):
# #             room_id = ObjectId(room_id)

# #         return list(self.collection.find({"room_id": room_id}))
    

# # from bson import ObjectId

# # class SlotModel:
# #     def __init__(self, db):
# #         self.collection = db['slots']

# #     def check_conflicts(self, slot_data, exclude_id=None):
# #         """
# #         Server-side validation for faculty, room, and lab availability.
# #         'exclude_id' is used during updates to ignore the current record.
# #         """
# #         # Base query for time/day overlap
# #         base_query = {
# #             "day": slot_data['day'],
# #             "time": slot_data['time'],
# #             "batch": {"$ne": slot_data['batch']}
# #         }

# #         # If we are updating, don't conflict with the slot's own current record
# #         if exclude_id:
# #             if isinstance(exclude_id, str):
# #                 exclude_id = ObjectId(exclude_id)
# #             base_query["_id"] = {"$ne": exclude_id}

# #         # 1. Faculty Conflict
# #         faculty_query = base_query.copy()
# #         faculty_query["faculty"] = slot_data['faculty']
# #         faculty_conflict = self.collection.find_one(faculty_query)

# #         # 2. Room Conflict
# #         room_conflict = None
# #         if slot_data.get('room_id'):
# #             room_query = base_query.copy()
# #             room_query["room_id"] = slot_data['room_id']
# #             room_conflict = self.collection.find_one(room_query)

# #         # 3. Lab Conflict
# #         lab_conflict = None
# #         if slot_data.get('lab_id'):
# #             lab_query = base_query.copy()
# #             lab_query["lab_id"] = slot_data['lab_id']
# #             lab_conflict = self.collection.find_one(lab_query)

# #         return faculty_conflict, room_conflict, lab_conflict

# #     def create_slot(self, slot_data):
# #         """Validates and inserts a new timetable slot."""
# #         f_conf, r_conf, l_conf = self.check_conflicts(slot_data)
        
# #         if f_conf or r_conf or l_conf:
# #             return {
# #                 "error": "Conflict detected", 
# #                 "faculty_conflict": bool(f_conf), 
# #                 "room_conflict": bool(r_conf),
# #                 "lab_conflict": bool(l_conf)
# #             }
            
# #         return self.collection.insert_one(slot_data)

# #     def update_slot(self, slot_id, slot_data):
# #         """Validates conflicts and updates an existing slot."""
# #         # Check conflicts but ignore the current slot ID
# #         f_conf, r_conf, l_conf = self.check_conflicts(slot_data, exclude_id=slot_id)
        
# #         if f_conf or r_conf or l_conf:
# #             return {
# #                 "error": "Conflict detected", 
# #                 "faculty_conflict": bool(f_conf), 
# #                 "room_conflict": bool(r_conf),
# #                 "lab_conflict": bool(l_conf)
# #             }

# #         result = self.collection.update_one(
# #             {"_id": ObjectId(slot_id)},
# #             {"$set": slot_data}
# #         )
# #         return result

# #     def delete_slot(self, slot_id):
# #         """Removes a slot from the database."""
# #         return self.collection.delete_one({"_id": ObjectId(slot_id)})

# #     def get_slots_by_batch(self, batch_name):
# #         """Retrieves the full schedule for a specific batch."""
# #         return list(self.collection.find({"batch": batch_name}))



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