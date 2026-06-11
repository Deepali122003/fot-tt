from bson.objectid import ObjectId
from models.batch_model import BatchModel
from models.faculty_model import FacultyModel
from models.room_model import RoomModel
from models.slot_model import SlotModel
from models.subject_model import SubjectModel
from models.lab_model import LabModel


class TimetableService:
    def __init__(self, db):
        self.db = db
        self.batch_model = BatchModel(db)
        self.faculty_model = FacultyModel(db)
        self.room_model = RoomModel(db)
        self.slot_model = SlotModel(db)
        self.subject_model = SubjectModel(db)
        self.lab_model = LabModel(db)

    # -------------------------
    # BATCH
    # -------------------------
    def create_batch(self, data):
        if isinstance(data, list):
            data = data[0] if data else {}
        if not data.get("name"):
            return {"error": "Batch name required"}, 400
        result = self.batch_model.create_batch(data)
        return {"id": str(result.inserted_id)}, 201

    def get_batches(self):
        return self.batch_model.get_all_batches()

    # -------------------------
    # FACULTY
    # -------------------------
    def create_faculty(self, data):
        result = self.faculty_model.create_faculty(data)
        return {"id": str(result.inserted_id)}, 201

    def get_faculties(self):
        return self.faculty_model.get_all_faculties()

    # -------------------------
    # ROOM
    # -------------------------
    def create_room(self, data):
        result = self.room_model.add_room(
            data.get("room_number"),
            data.get("capacity"),
            data.get("building", "Main Block")
        )
        return {"id": str(result.inserted_id)}, 201

    def get_rooms(self):
        return self.room_model.get_available_rooms()

    def get_labs(self):
        return self.lab_model.get_all_labs()

    # -------------------------
    # CREATE SLOT
    # ← No sync here — routes.py handles it
    # -------------------------
    def process_new_slot(self, data):
        batch = self.db.batches.find_one({"name": data.get("batch")})
        faculty = self.db.faculties.find_one({"name": data.get("faculty")})

        if not batch:
            return {"error": "Batch not found"}, 404
        if not faculty:
            return {"error": "Faculty not found"}, 404

        room_input = data.get("room_id")
        room = self.db.rooms.find_one({"room_number": room_input})

        slot_data = {
            "subject":     data.get("subject"),
            "subBatch":    data.get("subBatch"),
            "faculty":     faculty["name"],
            "faculty_id":  str(faculty["_id"]),
            "room_id":     str(room["_id"]) if room else None,
            "room_number": room_input if room_input else None,
            "batch":       batch["name"],
            "batch_id":    str(batch["_id"]),
            "day":         data.get("day"),
            "time":        data.get("time"),
        }

        result = self.slot_model.create_slot(slot_data)

        if isinstance(result, dict) and "error" in result:
            return result, 409

        # ✅ Return slot_data too so routes.py can sync it
        return {"message": "Slot added", "id": str(result.inserted_id), "slot": slot_data}, 201

    # -------------------------
    # DELETE SLOT
    # ← No sync here — routes.py handles it
    # -------------------------
    def delete_slot(self, slot_id):
        slot = self.db.slots.find_one({"_id": ObjectId(slot_id)})
        if not slot:
            return {"error": "Slot not found"}, 404

        result = self.slot_model.delete_slot(slot_id)
        if result.deleted_count == 0:
            return {"error": "Slot not found"}, 404

        return {"message": "Slot deleted successfully"}, 200

    # -------------------------
    # UPDATE SLOT
    # ← No sync here — routes.py handles it
    # -------------------------
    def update_slot(self, slot_id, data):
        old_slot = self.db.slots.find_one({"_id": ObjectId(slot_id)})

        result = self.slot_model.update_slot(slot_id, data)
        if isinstance(result, dict) and result.get("error"):
            return result, 409

        new_slot = self.db.slots.find_one({"_id": ObjectId(slot_id)})

        # ✅ Return both old and new so routes.py can sync delete+create
        return {"message": "Slot updated", "old_slot": old_slot, "new_slot": new_slot}, 200

    # -------------------------
    # FETCH SCHEDULE
    # -------------------------
    def get_schedule_by_batch(self, batch_name):
        slots = self.slot_model.get_slots_by_batch(batch_name)
        for slot in slots:
            slot["_id"] = str(slot["_id"])
            if slot.get("batch_id"):
                slot["batch_id"] = str(slot["batch_id"])
            if slot.get("faculty_id"):
                slot["faculty_id"] = str(slot["faculty_id"])
            if slot.get("room_id") and not isinstance(slot["room_id"], str):
                slot["room_id"] = str(slot["room_id"])
        return slots

    # -------------------------
    # SEARCH SUBJECT
    # -------------------------
    def search_subjects(self, query):
        return self.subject_model.search_subjects(query)