const mongoose = require("mongoose");

const sampleData = {
  Education: [
    {
      title: "Help Priya Complete Her Computer Engineering Degree",
      description: "Priya is a gifted first-generation college student who needs tuition and lab support to complete her final semester of engineering.",
      targetAmount: 75000,
      currentAmount: 52000,
      coverImage: "/images/education.jpg",
    },
    {
      title: "Digital Classrooms for Rural Primary Schools",
      description: "Equipping 5 village schools with tablets, offline educational software, and solar power packs so children can learn modern digital skills.",
      targetAmount: 120000,
      currentAmount: 45000,
      coverImage: "/images/volunteer-teaching-in-africa-orphanage-in-kenya.webp",
    },
    {
      title: "Books & Science Kits for Underprivileged Girls",
      description: "Providing science lab boxes, notebooks, and reference books for 200 middle school girls in remote districts.",
      targetAmount: 50000,
      currentAmount: 31000,
      coverImage: "/images/donation10.avif",
    },
    {
      title: "Scholarship Fund for Higher Secondary Aspirants",
      description: "Covering school uniforms, bus passes, and exam registration fees for meritorious students from low-income agricultural households.",
      targetAmount: 90000,
      currentAmount: 78000,
      coverImage: "/images/donation1.avif",
    },
  ],
  Healthcare: [
    {
      title: "Emergency Heart Surgery for 6-Year-Old Aarav",
      description: "Aarav was diagnosed with a congenital heart defect. His family urgently needs funds to cover the hospital and surgical ICU expenses.",
      targetAmount: 350000,
      currentAmount: 240000,
      coverImage: "/images/healthcare.jpg",
    },
    {
      title: "Dialysis & Medication Support for Elder Care Center",
      description: "Providing subsidized dialysis cycles and essential kidney medications for 40 abandoned senior citizens living in an elder shelter.",
      targetAmount: 150000,
      currentAmount: 92000,
      coverImage: "/images/donation5.webp",
    },
    {
      title: "Mobile Cancer Screening Camps in Tribal Belts",
      description: "Funding diagnostic mammography and oral cancer screening vans with trained oncology nurses visiting remote tea plantation villages.",
      targetAmount: 200000,
      currentAmount: 135000,
      coverImage: "/images/donation7.jpg",
    },
    {
      title: "Cochlear Implant for Hearing-Impaired Toddler",
      description: "Baby Meera was born with bilateral severe hearing loss. A cochlear implant before age 3 will enable her to speak and hear normally.",
      targetAmount: 500000,
      currentAmount: 310000,
      coverImage: "/images/donation8.jpg",
    },
  ],
  "Animal Welfare": [
    {
      title: "Critical Medical Care & Shelter for Injured Stray Animals",
      description: "Our animal rescue hospital treats 30+ dogs, cats, and cattle daily suffering from road accidents and severe infections.",
      targetAmount: 100000,
      currentAmount: 64000,
      coverImage: "/images/animal.jpg",
    },
    {
      title: "Feed 500 Community Street Dogs Daily This Winter",
      description: "Providing warm nutritious porridge, vaccinations, and reflective safety collars for community street dogs across urban colonies.",
      targetAmount: 60000,
      currentAmount: 48000,
      coverImage: "/images/donation11.jpg",
    },
    {
      title: "Ambulance for Wildlife & Avian Rescue Operations",
      description: "Refurbishing our animal rescue van with oxygen cages and bird treatment kits to respond swiftly to kite entanglement emergencies.",
      targetAmount: 180000,
      currentAmount: 85000,
      coverImage: "/images/animal.jpg",
    },
    {
      title: "Sanctuary Expansion for Abandoned & Disabled Cattle",
      description: "Building weatherproof sheds, soft bedding, and veterinary supplies for 80 rescued older and injured cattle.",
      targetAmount: 125000,
      currentAmount: 95000,
      coverImage: "/images/donation11.jpg",
    },
  ],
  Environment: [
    {
      title: "Clean Rivers & Mangrove Reforestation Drive",
      description: "Mobilizing local community volunteers to clear river plastics and plant 10,000 salt-tolerant mangrove saplings along the coastal belt.",
      targetAmount: 160000,
      currentAmount: 110000,
      coverImage: "/images/donation6.jpg",
    },
    {
      title: "Urban Forestation: 5,000 Miyawaki Native Trees",
      description: "Creating dense micro-forests with native neem, banyan, and peepal trees to combat severe city heat islands and purify local air.",
      targetAmount: 90000,
      currentAmount: 72000,
      coverImage: "/images/donation6.jpg",
    },
    {
      title: "Solar Water Pumping Systems for Drought-Hit Villages",
      description: "Installing durable solar-powered borewell pumps to provide continuous clean water for domestic use and community vegetable gardens.",
      targetAmount: 220000,
      currentAmount: 140000,
      coverImage: "/images/fundraise1.jpg",
    },
    {
      title: "Zero-Plastic School Campaign & Compost Stations",
      description: "Setting up organic composting pits and stainless steel water filtration dispensers across 15 government secondary schools.",
      targetAmount: 70000,
      currentAmount: 42000,
      coverImage: "/images/donation6.jpg",
    },
  ],
  "Disaster Relief": [
    {
      title: "Immediate Food & Emergency Shelter for Flood Victims",
      description: "Delivering cooked meals, clean drinking water pouches, tarpaulins, and sanitary kits to 500 displaced flood-affected families.",
      targetAmount: 250000,
      currentAmount: 195000,
      coverImage: "/images/disaster.jpg",
    },
    {
      title: "Rebuilding Homes for Cyclone-Hit Coastal Communities",
      description: "Providing corrugated roofing sheets, cement blocks, and structural repair supplies to restore damaged fishermen homes.",
      targetAmount: 400000,
      currentAmount: 280000,
      coverImage: "/images/disaster.jpg",
    },
    {
      title: "Medical Relief Camps in Landslide-Stricken Hill Districts",
      description: "Deploying emergency doctors, water purification tablets, and hygiene kits to cut-off mountainous hamlets after torrential rains.",
      targetAmount: 130000,
      currentAmount: 88000,
      coverImage: "/images/disaster.jpg",
    },
    {
      title: "Winter Relief Kits for Families in Drought Migrant Camps",
      description: "Distributing thick blankets, thermal jackets, and dry ration staples to vulnerable migrant families living in temporary settlements.",
      targetAmount: 110000,
      currentAmount: 91000,
      coverImage: "/images/disaster.jpg",
    },
  ],
  "Child Welfare": [
    {
      title: "Nutritious Hot Meals for 300 Slum Children Daily",
      description: "Ensuring children receive balanced, protein-rich lunches with milk and fruit to prevent severe childhood malnutrition and boost school retention.",
      targetAmount: 85000,
      currentAmount: 67000,
      coverImage: "/images/donation9.jpg",
    },
    {
      title: "Safe Shelter & Counseling for Orphaned Street Youths",
      description: "Funding rent, round-the-clock child protection workers, and vocational learning modules for our transitional shelter home.",
      targetAmount: 210000,
      currentAmount: 145000,
      coverImage: "/images/donation9.jpg",
    },
    {
      title: "Winter Clothing & Boots for High-Altitude Orphanage",
      description: "Keeping 120 Himalayan boarding school orphans warm through freezing winters with fleece jackets, thermals, and waterproof boots.",
      targetAmount: 75000,
      currentAmount: 56000,
      coverImage: "/images/volunteer-teaching-in-africa-orphanage-in-kenya.webp",
    },
    {
      title: "Special Education & Therapy for Differently-Abled Kids",
      description: "Providing speech therapy, sensory integration equipment, and trained special educators for children with autism and cerebral palsy.",
      targetAmount: 175000,
      currentAmount: 120000,
      coverImage: "/images/donation9.jpg",
    },
  ],
};

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB for seeding check...");

  // Import models
  const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({
    name: String,
    email: String,
    image: String,
    username: String,
  }, { timestamps: true }));

  const Fundraiser = mongoose.models.Fundraiser || mongoose.model("Fundraiser", new mongoose.Schema({
    title: String,
    description: String,
    targetAmount: Number,
    currentAmount: Number,
    coverImage: String,
    category: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
    documents: Array,
  }, { timestamps: true }));

  // Find or create organizer user
  let organizer = await User.findOne();
  if (!organizer) {
    organizer = await User.create({
      name: "Monetra Foundation",
      email: "community@monetra.org",
      username: "monetrafoundation",
      image: "https://lh3.googleusercontent.com/a/ACg8ocJi_q7UCzhhJfNT3zJ5Kt7QV-K80IBGuPMtsLIXQJa_SgorjbY=s96-c",
    });
    console.log("Created platform organizer user.");
  } else {
    console.log("Using existing user as organizer:", organizer.name, `(${organizer.email})`);
  }

  let totalAdded = 0;

  for (const [category, campaigns] of Object.entries(sampleData)) {
    const existingCount = await Fundraiser.countDocuments({ category, isActive: true });
    console.log(`Category "${category}": currently has ${existingCount} fundraisers.`);

    const needed = Math.max(0, 4 - existingCount);
    if (needed > 0) {
      console.log(`Seeding ${needed} fundraisers for "${category}"...`);
      const toInsert = campaigns.slice(0, needed).map((c) => ({
        ...c,
        category,
        owner: organizer._id,
        isActive: true,
        documents: [],
      }));

      await Fundraiser.insertMany(toInsert);
      totalAdded += needed;
    }
  }

  const finalTotal = await Fundraiser.countDocuments({ isActive: true });
  console.log(`\n✅ Seeding complete! Added ${totalAdded} campaigns.`);
  console.log(`Total active fundraisers in database: ${finalTotal}`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
