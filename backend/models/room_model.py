class RoomModel:
    def __init__(self, db):
        self.collection = db['rooms']

    def get_available_rooms(self):
        """Fetches all registered rooms/labs."""
        rooms = list(self.collection.find())
        for r in rooms:
            r['_id'] = str(r['_id'])
        return rooms

    def add_room(self, room_number, capacity, building="Main Block"):
        room_data = {
            "room_number": room_number,
            "capacity": capacity,
            "building": building
        }
        return self.collection.insert_one(room_data)