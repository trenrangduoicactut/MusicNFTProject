const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 5001;
const BASE_URL =
  process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json());

const metadataDir = path.join(__dirname, "metadata");

if (!fs.existsSync(metadataDir)) {
  fs.mkdirSync(metadataDir);
}

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "SoundRights Metadata Service",
  });
});

app.post("/api/metadata", (req, res) => {
  try {
    const {
      title,
      artist,
      licenseType,
      royalty,
      audioHash,
      rightsHash,
      audioFileName,
      rightsFileName,
      fingerprintsCount,
    } = req.body;

    if (!title || !artist || !audioHash || !rightsHash) {
      return res.status(400).json({
        message: "Missing required metadata fields",
      });
    }

    const tokenMetadata = {
      name: title,
      description: `Music Copyright NFT for "${title}" by ${artist}`,

      image:
        "https://placehold.co/600x600/png?text=Music+NFT",

      external_url: BASE_URL,

      attributes: [
        {
          trait_type: "Artist",
          value: artist,
        },
        {
          trait_type: "License Type",
          value: licenseType,
        },
        {
          trait_type: "Royalty",
          value: `${Number(royalty) / 100}%`,
        },
        {
          trait_type: "Audio Hash",
          value: audioHash,
        },
        {
          trait_type: "Rights Hash",
          value: rightsHash,
        },
        {
          trait_type: "Audio File",
          value: audioFileName || "Unknown",
        },
        {
          trait_type: "Rights Document",
          value: rightsFileName || "Unknown",
        },
        {
          trait_type: "Fingerprint Segments",
          value: fingerprintsCount || 0,
        },
      ],
    };

    const safeTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");

    const fileName =
      `${Date.now()}-${safeTitle}.json`;

    const filePath = path.join(
      metadataDir,
      fileName
    );

    fs.writeFileSync(
      filePath,
      JSON.stringify(tokenMetadata, null, 2)
    );

    const metadataURL =
      `${BASE_URL}/metadata/${fileName}`;

    res.json({
      success: true,
      metadataURL,
      metadata: tokenMetadata,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Cannot create metadata",
    });
  }
});

app.use(
  "/metadata",
  express.static(metadataDir)
);

app.listen(PORT, () => {
  console.log(
    `Metadata backend running at ${BASE_URL}`
  );
});