from bson import ObjectId

class SlotModel:
    def __init__(self, db):
        self.collection = db['slots']

    TIMES = ["8-9","9-10","10-11","11-12","12-1","1-2","2-3","3-4","4-5","5-6"]

    def get_occupied_times(self, slot_data):
        times = self.TIMES
        start = slot_data.get("time")
        duration = int(slot_data.get("duration", 1))
        if start not in times:
            return [start]
        idx = times.index(start)
        return [times[i] for i in range(idx, min(idx + duration, len(times)))]

    def check_conflicts(self, slot_data, exclude_id=None):
        occupied_times = set(self.get_occupied_times(slot_data))

        query_base = {"day": slot_data['day']}
        if exclude_id:
            if isinstance(exclude_id, str):
                exclude_id = ObjectId(exclude_id)
            query_base["_id"] = {"$ne": exclude_id}

        def find_conflict(field, value):
            if not value:
                return None
            candidates = self.collection.find({**query_base, field: value})
            for existing in candidates:
                existing_times = set(self.get_occupied_times(existing))
                if existing_times & occupied_times:
                    return existing
            return None

        def subbatches_overlap(sub_a, sub_b):
            a = (sub_a or "").strip().upper()
            b = (sub_b or "").strip().upper()
            if a in ("", "-", "ALL") or b in ("", "-", "ALL"):
                return True
            return a == b

        def find_batch_conflict():
            batch = slot_data.get("batch")
            if not batch:
                return None
            candidates = self.collection.find({**query_base, "batch": batch})
            for existing in candidates:
                existing_times = set(self.get_occupied_times(existing))
                if not (existing_times & occupied_times):
                    continue
                if subbatches_overlap(slot_data.get("subBatch"), existing.get("subBatch")):
                    return existing
            return None

        faculty_conflict = find_conflict("faculty", slot_data.get("faculty"))
        room_conflict = find_conflict("room_number", slot_data.get("room_number"))
        lab_conflict = find_conflict("lab_name", slot_data.get("lab_name"))
        batch_conflict = find_batch_conflict()

        return faculty_conflict, room_conflict, lab_conflict, batch_conflict

    def _conflict_payload(self, f_conf, r_conf, l_conf, b_conf):
        return {
            "error": "Conflict detected",
            "faculty_conflict": bool(f_conf),
            "room_conflict": bool(r_conf),
            "lab_conflict": bool(l_conf),
            "batch_conflict": bool(b_conf),
            "conflict_details": {
                "faculty": f_conf.get("subject_acronym") or f_conf.get("subject") if f_conf else None,
                "room": r_conf.get("subject_acronym") or r_conf.get("subject") if r_conf else None,
                "lab": l_conf.get("subject_acronym") or l_conf.get("subject") if l_conf else None,
                "batch": b_conf.get("subject_acronym") or b_conf.get("subject") if b_conf else None,
            }
        }

    def create_slot(self, slot_data, force=False):
        if not force:
            f_conf, r_conf, l_conf, b_conf = self.check_conflicts(slot_data)
            if f_conf or r_conf or l_conf or b_conf:
                return self._conflict_payload(f_conf, r_conf, l_conf, b_conf)
        return self.collection.insert_one(slot_data)

    def update_slot(self, slot_id, slot_data, force=False):
        if not force:
            f_conf, r_conf, l_conf, b_conf = self.check_conflicts(slot_data, exclude_id=slot_id)
            if f_conf or r_conf or l_conf or b_conf:
                return self._conflict_payload(f_conf, r_conf, l_conf, b_conf)
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