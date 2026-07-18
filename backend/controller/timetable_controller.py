from flask import jsonify
from bson import ObjectId
from services.timetable_service import TimetableService


def handle_batches(db, request):
    service = TimetableService(db)
    if request.method == 'POST':
        result, status = service.create_batch(request.json)
        return jsonify(result), status
    return jsonify(service.get_batches()), 200


def handle_faculties(db, request):
    service = TimetableService(db)
    if request.method == 'POST':
        result, status = service.create_faculty(request.json)
        return jsonify(result), status
    return jsonify(service.get_faculties()), 200


def handle_rooms(db, request):
    service = TimetableService(db)
    if request.method == 'POST':
        result, status = service.create_room(request.json)
        return jsonify(result), status
    return jsonify(service.get_rooms()), 200


def handle_labs(db, request):
    service = TimetableService(db)
    return jsonify(service.get_labs()), 200


# ────────────────────────────────────────
# ADD SLOT
# ────────────────────────────────────────
def add_slot(db, request):
    from routes.routes import notify_sheets, build_sheet_data

    service = TimetableService(db)
    result, status = service.process_new_slot(request.json)

    if status == 201 and "slot" in result:
        # ✅ Build sheet data with db for room lookup
        sheet_data = build_sheet_data(result["slot"], db)
        notify_sheets("create", sheet_data)
        result.pop("slot")  # clean before returning to frontend

    return jsonify(result), status


# ────────────────────────────────────────
# MODIFY SLOT
# ────────────────────────────────────────
def modify_slot(db, request, slot_id):
    from routes.routes import notify_sheets, build_sheet_data

    service = TimetableService(db)
    result, status = service.update_slot(slot_id, request.json)

    if status == 200:
        # ✅ Delete old entry from ALL 3 sheets
        if result.get("old_slot"):
            old_sheet_data = build_sheet_data(result["old_slot"], db)
            notify_sheets("delete", old_sheet_data)

        # ✅ Write new entry to ALL 3 sheets
        if result.get("new_slot"):
            new_sheet_data = build_sheet_data(result["new_slot"], db)
            notify_sheets("create", new_sheet_data)

        # ✅ Clean up before returning to frontend
        result.pop("old_slot", None)
        result.pop("new_slot", None)

    return jsonify(result), status


# ────────────────────────────────────────
# REMOVE SLOT
# ────────────────────────────────────────
def remove_slot(db, slot_id):
    service = TimetableService(db)
    result, status = service.delete_slot(slot_id)
    return jsonify(result), status


# ────────────────────────────────────────
# DELETE BY BODY
# ────────────────────────────────────────
def delete_slot_by_body(db, request):
    data = request.get_json()
    slot_id = data.get("id")

    if not slot_id:
        return jsonify({"error": "Slot ID required"}), 400

    service = TimetableService(db)
    result, status = service.delete_slot(slot_id)
    return jsonify(result), status


def get_batch_schedule(db, batch_name):
    service = TimetableService(db)
    schedule = service.get_schedule_by_batch(batch_name)
    return jsonify(schedule), 200


def search_subjects(db, request):
    service = TimetableService(db)
    query = request.args.get('q', '')
    return jsonify(service.search_subjects(query)), 200

def handle_subjects(db, request):
    service = TimetableService(db)
    if request.method == 'POST':
        result, status = service.create_subject(request.json)
        return jsonify(result), status
    return jsonify(service.get_subjects()), 200

def delete_subject(db, subject_id):
    service = TimetableService(db)
    result, status = service.delete_subject(subject_id)
    return jsonify(result), status
# ────────────────────────────────────────
# SYNC
# ────────────────────────────────────────
def sync_sheet_data(db, request):
    data = request.json
    action = data.get('action')
    target = data.get('type')
    payload = data.get('data')

    service = TimetableService(db)

    try:
        if target == 'slot':
            if action == 'create':
                return service.process_new_slot(payload)
            elif action == 'update':
                return service.update_slot(payload.get('_id'), payload)
            elif action == 'delete':
                return service.delete_slot(payload.get('_id'))

        return {"error": "Target type not supported"}, 400

    except Exception as e:
        return {"error": str(e)}, 500