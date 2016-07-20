/*
 * Available information:
 * 1. Request queue
 * Simulator.get_instance().get_requests()
 * Array of integers representing floors where there are people calling the elevator
 * eg: [7,3,2] // There are 3 people waiting for the elevator at floor 7,3, and 2, in that order
 *
 * 2. Elevator object
 * To get all elevators, Simulator.get_instance().get_building().get_elevator_system().get_elevators()
 * Array of Elevator objects.
 * - Current floor
 * elevator.at_floor()
 * Returns undefined if it is moving and returns the floor if it is waiting.
 * - Destination floor
 * elevator.get_destination_floor()
 * The floor the elevator is moving toward.
 * - Position
 * elevator.get_position()
 * Position of the elevator in y-axis. Not necessarily an integer.
 * - Elevator people
 * elevator.get_people()
 * Array of people inside the elevator
 *
 * 3. Person object
 * - Floor
 * person.get_floor()
 * - Destination
 * person.get_destination_floor()
 * - Get time waiting for an elevator
 * person.get_wait_time_out_elevator()
 * - Get time waiting in an elevator
 * person.get_wait_time_in_elevator()
 *
 * 4. Time counter
 * Simulator.get_instance().get_time_counter()
 * An integer increasing by 1 on every simulation iteration
 *
 * 5. Building
 * Simulator.get_instance().get_building()
 * - Number of floors
 * building.get_num_floors()
 */

Elevator.prototype.decide = function() {
    var simulator = Simulator.get_instance();
    var building = simulator.get_building();
    var num_floors = building.get_num_floors();
    var elevators = Simulator.get_instance().get_building().get_elevator_system().get_elevators();
    var time_counter = simulator.get_time_counter();
    var requests = simulator.get_requests();

    var elevator = this;
    var people = this.get_people();
    var person = people.length > 0 ? people[0] : undefined;


    if(elevator) {
        elevator.at_floor();
        elevator.get_destination_floor();
        elevator.get_position();
    }

    var destPeople = [];
    people.forEach(function(person) {
        destPeople.push(person.get_destination_floor());
    });

    //sorting descending tujuan penumpang. utamakan yang ingin naik ke atas
    destPeople.sort(function(a, b) {
        return b - a;
    });
    //ambil destinasi penumpang yang ingin naik ke lantai yang paling atas
    var destination = destPeople.length > 0 ?destPeople[0]: undefined;

    if(destination) {

        var destination = destPeople[0];
        //kalau lift lagi mau ke atas
        if(destination > elevator.at_floor()) {

            //cari request yang berada di antara lift dan lantai tujuan
            var tempReqs = requests.filter(function(request) {
                    return request < destination && request > elevator.at_floor();
            });
            //kalau ada yg request. sorting descending
            if(tempReqs.length > 0) {
                tempReqs.sort(function(a, b) {
                    return b - a;
                });
                //ganti tujuan ke tempat penumpang yang request
                destination = tempReqs[0];
            }

        }
        else if (destination < elevator.at_floor()){ //kalo lift mau kebawah
            //cari penumpang yang berada di bawah lift
            var tempReqs = requests.filter(function(request) {
                    return request > destination && request < elevator.at_floor();
            });
            //kalau ada, sorting ascending
            if(tempReqs.length > 0) {
                tempReqs.sort(function(a, b) {
                    return a - b;
                });
                //ganti tujuan ke tempat penumpang yang request
                destination = tempReqs[0];
            }

        }

        return this.commit_decision(destination);
    }


    for(var i = 0;i < requests.length;i++) {
        var handled = false;
        for(var j = 0;j < elevators.length;j++) {
            if(elevators[j].get_destination_floor() == requests[i]) {
                handled = true;
                break;
            }
        }
        if(!handled) {

            return this.commit_decision(requests[i]);
        }
    }

    return this.commit_decision(Math.floor(num_floors / 2));
};
