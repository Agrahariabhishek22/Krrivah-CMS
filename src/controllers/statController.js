const prisma=require('../prismaClient')

exports.createStats = async (req, res, next) => {
  try {
    const existing = await prisma.stats.findFirst();
    if (existing) {
      return res.status(400).json({ error: "Stats already exists. Only one record allowed." });
    }

    const { area, years, amenities, commitments } = req.body;

    const newStats = await prisma.stats.create({
      data: {
        area,
        years,
        amenities,
        commitments,
      },
    });

    return res.status(201).json(new ApiResponse(201, "Stats created successfully", newStats));
  } catch (error) {
    next(error);
  }
};

exports.deleteStats = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await prisma.stats.delete({
      where: { id },
    });

    return res.status(200).json(new ApiResponse(200, "Stats deleted", deleted));
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const stats = await prisma.stats.findFirst();

    if (!stats) {
      return res.status(404).json({ error: "Stats not found" });
    }

    return res.status(200).json(new ApiResponse(200, "Stats fetched", stats));
  } catch (error) {
    next(error);
  }
};

exports.updateStats = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { area, years, amenities, commitments } = req.body;

    const updateData = {};
    if (area) updateData.area = area;
    if (years) updateData.years = years;
    if (amenities) updateData.amenities = amenities;
    if (commitments) updateData.commitments = commitments;

    const updated = await prisma.stats.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json(new ApiResponse(200, "Stats updated", updated));
  } catch (error) {
    next(error);
  }
};
