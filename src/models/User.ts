import { Schema, model, Types } from "mongoose";
import { softDeletePlugin } from "./Plugins";

const userSchema = new Schema({
  complex_id: {
    type: Types.ObjectId,
    ref: "Complex",
    required: function () {
      return this.role !== "super_admin";
    },
  },
  house_id: { type: Types.ObjectId, ref: "House" }, // Opcional para Admin/Security
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false }, // No se envía en los GET por seguridad
  role: {
    type: String,
    enum: ["super_admin", "admin", "resident", "security"],
    default: "resident",
  },
  phone: { type: String },
  must_change_password: { type: Boolean, default: true },
});

userSchema.plugin(softDeletePlugin);
export default model("User", userSchema);
