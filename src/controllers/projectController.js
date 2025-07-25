const prisma = require("../prismaClient");
const ApiResponse = require("../utils/apiResponse");
const { cloudinary } = require("../utils/cloudinary");
const { getPublicIdFromUrl } = require("../utils/cloudinaryHelper");

exports.createProject = async (req, res, next) => {
  try {
    const {
      category,
      title,
      location,
      short_des,
      long_des,
      amenities, // array of { title, listings[] }
    } = req.body;    

    const brochureFile = req.files?.brochure?.[0];
    const imageFiles = req.files?.images || [];

    if (!brochureFile) {
      return res.status(400).json({ error: "Brochure PDF is required" });
    }

    if (imageFiles.length > 10) {
      return res.status(400).json({ error: "Max 10 images allowed" });
    }

    const imageUrls = imageFiles.map((file) => file.path);
    const brochureUrl = brochureFile.path;

    // Parse amenities
    let amenitiesData = [];
    if (amenities) {
      const parsed = typeof amenities === "string" ? JSON.parse(amenities) : amenities;
      amenitiesData = parsed.map((a) => ({
        title: a.title,
        listings: a.listings,
      }));
    }

    const createdProject = await prisma.project.create({
      data: {
        category,
        title,
        location,
        short_des,
        long_des,
        thumbnail: imageUrls[0], // default first image
        images: imageUrls,
        Brochure: brochureUrl,
        Amenities: {
          create: amenitiesData,
        },
      },
      include: {
        Amenities: true,
      },
    });

    return res.status(201).json(new ApiResponse(201, "Project created", createdProject));
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id);
    const existing = await prisma.project.findUnique({ where: { id: projectId } });
    if (!existing) {
      return res.status(404).json({ error: "Project not found" });
    }

    const files = req.files;
    const {
      category,
      title,
      location,
      short_des,
      long_des,
      isActive,
      amenities, // stringified JSON
    } = req.body;

    //  Build dynamic updateData only from provided fields
    const updateData = {};

    if (category) updateData.category = category;
    if (title) updateData.title = title;
    if (location) updateData.location = location;
    if (short_des) updateData.short_des = short_des;
    if (long_des) updateData.long_des = long_des;
    if (isActive !== undefined) updateData.isActive = isActive ;

    // 👇 Brochure update
    if (files?.brochure?.[0]) {
      const oldId = getPublicIdFromUrl(existing.Brochure);
      if (oldId) {
        await cloudinary.uploader.destroy(`Krrivah/Brochures/${oldId}`, {
          resource_type: "raw",
        });
      }
      updateData.Brochure = files.brochure[0].path;
    }

    // 👇 Images update
    if (files?.images?.length > 0) {
      for (const img of existing.images) {
        const publicId = getPublicIdFromUrl(img);
        if (publicId) {
          await cloudinary.uploader.destroy(`Krrivah/Images/${publicId}`, {
            resource_type: "image",
          });
        }
      }
      const newImages = files.images.map((f) => f.path);
      updateData.images = newImages;
      updateData.thumbnail = newImages[0];
    }

    // 👇 Update amenities only if provided
    if (amenities) {
      const parsedAmenities = typeof amenities === "string" ? JSON.parse(amenities) : amenities;

      await prisma.amenitiy.deleteMany({ where: { projectId } });
      await prisma.amenitiy.createMany({
        data: parsedAmenities.map((a) => ({
          projectId,
          title: a.title,
          listings: a.listings,
        })),
      });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: { Amenities: true },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Project updated successfully", updated));
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { Amenities: true },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    //  Delete brochure from Cloudinary
    if (project.Brochure) {
      const publicId = getPublicIdFromUrl(project.Brochure);
      if (publicId) {
        await cloudinary.uploader.destroy(`Krrivah/Brochures/${publicId}`, {
          resource_type: "raw",
        });
      }
    }

    //  Delete images from Cloudinary
    for (const imgUrl of project.images) {
      const publicId = getPublicIdFromUrl(imgUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(`Krrivah/Images/${publicId}`, {
          resource_type: "image",
        });
      }
    }

    //  Delete amenities
    await prisma.amenitiy.deleteMany({ where: { projectId } });

    //  Delete the project
    await prisma.project.delete({ where: { id: projectId } });

    return res
      .status(200)
      .json(new ApiResponse(200, "Project deleted successfully", project));
  } catch (error) {
    next(error);
  }
};

exports.getAllProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        Amenities: true,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Projects fetched successfully", projects));
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        Amenities: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Project fetched successfully", project));
  } catch (error) {
    next(error);
  }
};
