import express from 'express';
import type { Request, Response, NextFunction } from 'express';
// Agregamos la palabra clave 'type' para los tipos de TS
// O si prefieres la sintaxis de desestructuración:
// import { type Request, type Response } from 'express';import * as HouseService from '../services/house.service';
import House from '../models/House';
import * as HouseService from '../services/house.service'
import User from '../models/User';

// Obtener la información completa de MI casa (Residente)
export const getMyHouse = async (req: any, res: Response) => {
  try {
    const house = await House.findById(req.user.house_id);
    if (!house) return res.status(404).json({ message: "House not found" });
    res.json(house);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Añadir Vehículo
export const addVehicle = async (req: any, res: Response) => {
  try {
    const house = await HouseService.addVehicleToHouse(req.user.house_id, req.body);
    res.status(201).json(house);
  } catch (error) {
    res.status(400).json({ message: "Error adding vehicle", error });
  }
};

// Eliminar Vehículo
export const deleteVehicle = async (req: any, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const house = await HouseService.removeVehicleFromHouse(req.user.house_id, vehicleId);
    res.json(house);
  } catch (error) {
    res.status(400).json({ error });
  }
};

// Eliminar Vehículo
export const deletePet = async (req: any, res: Response) => {
  try {
    const { petId } = req.params;
    const house = await HouseService.removePetFromHouse(req.user.house_id, petId);
    res.json(house);
  } catch (error) {
    res.status(400).json({ error });
  }
};

// Los métodos para Mascotas siguen la misma lógica...
export const addPet = async (req: any, res: Response) => {
  try {
    const house = await HouseService.addPetToHouse(req.user.house_id, req.body);
    res.status(201).json(house);
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const getHouses = async (req: any, res: Response) => {
  try {
    // 1. Extraemos el rol y el complex_id del usuario autenticado
    const { role, complex_id, id } = req.user;

    const adminUser = await User.findById(id);

    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // 2. Definimos el filtro de búsqueda dinámicamente
    // Si es super_admin, el filtro es un objeto vacío (trae todo)
    // De lo contrario, filtramos por su complejo asignado
    const filter = role === 'super_admin' ? {} : { complex_id: adminUser.complex_id };

    // 3. Ejecutamos la búsqueda con el filtro correspondiente
    // Agregamos .populate('complex_id', 'name') por si el super_admin 
    // necesita saber a qué complejo pertenece cada casa en la lista
    const houses = await House.find(filter)
      .populate('complex_id', 'name') 
      .sort({ street: 1, house_number: 1 });

    res.status(200).json(houses);
  } catch (error: any) {
    console.error("Error en getHouses:", error);
    res.status(500).json({ 
      message: 'Error al obtener casas', 
      error: error.message 
    });
  }
};

// Crear una nueva casa vinculada al complejo del admin
export const createHouse = async (req: any, res: Response) => {
  try {
    // 1. Obtenemos el ID del usuario desde el token decodificado
    // (Asegúrate de que tu middleware de auth guarde el id en req.user.id)
    const userId = req.user.id; 
    const { house_number, street } = req.body;

    // 2. Buscamos al usuario en la DB para obtener su complex_id actual
    const adminUser = await User.findById(userId);

    if (!adminUser || !adminUser.complex_id) {
      return res.status(403).json({ 
        message: 'No tienes un complejo residencial asignado para realizar esta operación.' 
      });
    }

    // 3. Creamos la casa usando el ID del complejo encontrado
    const newHouse = await House.create({
      complex_id: adminUser.complex_id,
      house_number,
      street
    });

    res.status(201).json(newHouse);
  } catch (error: any) {
    console.error("Error en createHouse:", error);
    res.status(400).json({ 
      message: 'Error al crear casa', 
      error: error.message || error 
    });
  }
};
// Actualizar datos de la casa
export const updateHouse = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updatedHouse = await House.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedHouse);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar', error });
  }
};

// Borrado lógico (Soft Delete)
export const deleteHouse = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await House.findByIdAndUpdate(id, { deleted_at: new Date() });
    res.status(200).json({ message: 'Casa eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ message: 'Error al eliminar', error });
  }
};