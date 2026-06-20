from flask import Blueprint, request, jsonify
from controller import timetable_controller
from bson.objectid import ObjectId
import requests as http_requests

# ── Your deployed Apps Script URL ──
APPS_SCRIPT_URL = "url :https://script.google.com/a/macros/fot.du.ac.in/s/AKfycbxCcQHYPlsPPdA5qgPVXpII6MRk9y1YvSdg32KngXqQBbt6WG4F88cBi0aM97F5gyM8/exec"



# SINGLE SOURCE OF TRUTH FOR SHEET PAYLOAD

def build_sheet_data(slot, db=None):
    room_number = slot.get("room_number")

    # If room_number missing, look it up from rooms collection
    if not room_number and slot.get("room_id") and db is not None:
        try:
            room = db.rooms.find_one({"_id": ObjectId(slot["room_id"])})
            if room:
                room_number = room.get("room_number")
        except Exception:
            pass

    return {
        "batch":       slot.get("batch", ""),
        "subject":     slot.get("subject", ""),
        "subBatch":    slot.get("subBatch") or "-",
        "faculty":     slot.get("faculty", ""),
        "room_number": room_number if room_number else "-",
        "day":         slot.get("day", ""),
        "time":        slot.get("time", ""),
    }


# ════════════════════════════════════════════
# GOOGLE SHEETS NOTIFIER
# ════════════════════════════════════════════
def notify_sheets(action, sheet_data):
    """Send a single slot action (create/delete) to Google Sheets."""
    try:
        print(f"=== SHEETS SYNC [{action.upper()}] ===")
        print(sheet_data)
        print("=====================================")
        http_requests.post(APPS_SCRIPT_URL, json={
            "action": action,
            "data":   sheet_data
        }, timeout=10)
    except Exception as e:
        print(f"[Sheets sync error] {e}")


# ════════════════════════════════════════════
# ROUTES
# ════════════════════════════════════════════
def construct_routes(db):
    api = Blueprint('api', __name__)

    @api.route('/sync', methods=['POST'])
    def sync():
        return timetable_controller.sync_sheet_data(db, request)

    @api.route('/batches', methods=['GET', 'POST'])
    def batches():
        return timetable_controller.handle_batches(db, request)

    @api.route('/faculties', methods=['GET', 'POST'])
    def faculties():
        return timetable_controller.handle_faculties(db, request)

    @api.route('/rooms', methods=['GET', 'POST'])
    def rooms():
        return timetable_controller.handle_rooms(db, request)

    @api.route('/labs', methods=['GET'])
    def labs():
        return timetable_controller.handle_labs(db, request)

    @api.route('/batches/<batch_id>', methods=['DELETE'])
    def delete_batch(batch_id):
        db.batches.delete_one({"_id": ObjectId(batch_id)})
        return jsonify({"message": "Deleted"}), 200

    @api.route('/faculties/<faculty_id>', methods=['DELETE'])
    def delete_faculty(faculty_id):
        db.faculties.delete_one({"_id": ObjectId(faculty_id)})
        return jsonify({"message": "Deleted"}), 200

    @api.route('/rooms/<room_id>', methods=['DELETE'])
    def delete_room(room_id):
        db.rooms.delete_one({"_id": ObjectId(room_id)})
        return jsonify({"message": "Deleted"}), 200
    # ────────────────────────────────────────
    # SLOTS — GET ALL / POST NEW
    # ────────────────────────────────────────
    @api.route('/slots', methods=['GET', 'POST'])
    def handle_slots():
        if request.method == 'POST':
            return timetable_controller.add_slot(db, request)
        slots = list(db.slots.find())
        for s in slots:
            s['_id'] = str(s['_id'])
        return jsonify(slots)

    # ────────────────────────────────────────
    # DELETE SLOT
    # ────────────────────────────────────────
    @api.route('/slots/<slot_id>', methods=['DELETE'])
    def delete_slot(slot_id):
        # Step 1: fetch slot BEFORE deleting
        slot = db.slots.find_one({"_id": ObjectId(slot_id)})
        if not slot:
            return jsonify({"error": "Slot not found"}), 404

        # Step 2: build normalized sheet payload
        # Pass db so room_number can be looked up if missing
        sheet_data = build_sheet_data(slot, db)

        # Step 3: delete from MongoDB
        db.slots.delete_one({"_id": ObjectId(slot_id)})

        # Step 4: sync deletion to ALL 3 sheets
        notify_sheets("delete", sheet_data)

        return jsonify({"message": "Deleted successfully"}), 200

    # ────────────────────────────────────────
    # UPDATE SLOT
    # ────────────────────────────────────────
    @api.route('/slots/<slot_id>', methods=['PUT'])
    def update_slot(slot_id):
        return timetable_controller.modify_slot(db, request, slot_id)

    # ════════════════════════════════════════════
    # FULL SYNC — wipe sheets then rebuild from MongoDB
    # Call this ONCE to fix any stale/orphaned data
    # ════════════════════════════════════════════
    @api.route('/sync-sheets', methods=['POST'])
    def sync_sheets():
        try:
            # Step 1: wipe all 3 sheets
            http_requests.post(
                APPS_SCRIPT_URL,
                json={"action": "clear_all"},
                timeout=15
            )

            # Step 2: re-create every slot from MongoDB
            slots = list(db.slots.find())
            for slot in slots:
                sheet_data = build_sheet_data(slot, db)  # ✅ pass db for room lookup
                notify_sheets("create", sheet_data)

            return jsonify({
                "message": f"Synced {len(slots)} slots successfully"
            }), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @api.route('/batches/<batch_name>/schedule', methods=['GET'])
    def get_batch_schedule(batch_name):
        return timetable_controller.get_batch_schedule(db, batch_name)

    @api.route('/subjects/search', methods=['GET'])
    def search():
        return timetable_controller.search_subjects(db, request)

    return api
