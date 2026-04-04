const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await prisma.equipment.findMany();
    res.status(200).json({ success: true, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};