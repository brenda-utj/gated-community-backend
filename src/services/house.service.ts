import House from '../models/House';

export const addVehicleToHouse = async (houseId: string, vehicleData: any) => {
  return await House.findByIdAndUpdate(
    houseId,
    { $push: { vehicles: vehicleData } },
    { new: true, runValidators: true }
  );
};

export const removeVehicleFromHouse = async (houseId: string, vehicleId: string) => {
  return await House.findByIdAndUpdate(
    houseId,
    { $pull: { vehicles: { _id: vehicleId } } },
    { new: true }
  );
};

export const addPetToHouse = async (houseId: string, petData: any) => {
  return await House.findByIdAndUpdate(
    houseId,
    { $push: { pets: petData } },
    { new: true, runValidators: true }
  );
};

export const removePetFromHouse = async (houseId: string, petId: string) => {
  return await House.findByIdAndUpdate(
    houseId,
    { $pull: { pets: { _id: petId } } },
    { new: true }
  );
};