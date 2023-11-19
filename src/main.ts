import { ErrorMapper } from "utils/ErrorMapper";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: string;
    room?: string;
    working?: boolean;
    harvestFrom: Id<Source>;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
      Memory: {creeps: {[p: string]: any}};
      Game: {creeps: {[p: string]: any}, rooms: any, spawns: any, time: any};
    }
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // this is the game loop. during every game tick, it runs the code below one time,
  // from top to bottom.
  console.log(`Current game tick is ${Game.time}`);

  // get a list of all the sources
  var listSources = Game.spawns["Spawn1"].room.find(FIND_SOURCES)

  // create a creep
  Game.spawns["Spawn1"].spawnCreep([WORK, CARRY, CARRY, MOVE], "Harvester" + Game.time.toString(), {memory:{role:'harvester', harvestFrom: listSources[1].id}});
  // make an easy reference to my creep

  for(var name in Game.creeps) {
    console.log(name);
    let myCreep = Game.creeps[name];
    // if my creep is not carrying any energy
    if (myCreep.store[RESOURCE_ENERGY] == 0) {
      // make an easy reference to the energy source
      let source: Source = <Source>Game.getObjectById(listSources[0].id);
      // move my creep to the energy source and harvest energy
      myCreep.moveTo(source);
      myCreep.harvest(source);
    } else {
      // make an easy reference to the room's controller
      //var controller = myCreep.room.controller;
      // move my creep to the controller and upgrade it
      //myCreep.moveTo(controller);
      //myCreep.upgradeController(controller);

      // make an easy reference to the creeps pareent spawn
      var spawn = myCreep.room.find(FIND_MY_SPAWNS)[0];
      // move my creep to the Spawn and store the energy in it
      myCreep.moveTo(spawn);
      myCreep.transfer(spawn, RESOURCE_ENERGY);
    }
  }

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
