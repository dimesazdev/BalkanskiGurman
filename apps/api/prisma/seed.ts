import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create Statuses
  const statuses = await prisma.status.createMany({
    data: [
      { Name: 'Active' },
      { Name: 'Suspended' },
      { Name: 'Banned' },
      { Name: 'Pending' },
      { Name: 'Approved' },
      { Name: 'Rejected' },
      { Name: 'RecheckRequested' },
    ],
  });

  // Create Roles
  const adminRole = await prisma.role.create({
    data: {
      Name: 'Admin',
      NormalizedName: 'ADMIN',
    },
  });

  const userRole = await prisma.role.create({
    data: {
      Name: 'User',
      NormalizedName: 'USER',
    },
  });

  // Create Users
  const adminUser = await prisma.user.create({
    data: {
      UserName: 'admin',
      Email: 'admin@balkanskigurman.com',
      EmailConfirmed: true,
      PasswordHash: 'hashed-admin-password',
      PhoneNumber: '070123456',
      PhoneNumberConfirmed: true,
      Name: 'Admin',
      Surname: 'User',
      City: 'Skopje',
      Country: 'North Macedonia',
      ProfilePictureUrl: 'https://example.com/admin-profile.jpg',
      StatusId: 1,
      BadgeLevel: 5,
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      UserName: 'user',
      Email: 'user@balkanskigurman.com',
      EmailConfirmed: true,
      PasswordHash: 'hashed-user-password',
      PhoneNumber: '071234567',
      PhoneNumberConfirmed: true,
      Name: 'Regular',
      Surname: 'User',
      City: 'Bitola',
      Country: 'North Macedonia',
      ProfilePictureUrl: 'https://example.com/user-profile.jpg',
      StatusId: 1,
      BadgeLevel: 1,
    },
  });

  // Assign Roles to Users
  await prisma.userRole.createMany({
    data: [
      { UserId: adminUser.UserId, RoleId: adminRole.RoleId },
      { UserId: normalUser.UserId, RoleId: userRole.RoleId },
    ],
  });

  // Create Address
  const address = await prisma.address.create({
    data: {
      Street: 'Makedonska 1',
      PostalCode: '1000',
      City: 'Skopje',
      Country: 'North Macedonia',
    },
  });

  // Create Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      Name: 'Balkan Bites',
      PriceRange: 2,
      Details: 'Authentic Balkan cuisine with a modern twist.',
      PhoneNumber: '072345678',
      Website: 'https://balkanbites.mk',
      MenuUrl: 'https://balkanbites.mk/menu',
      AddressId: address.AddressId,
      AverageRating: 4.5,
      IsClaimed: true,
      ClaimedByUserId: adminUser.UserId,
      ClaimedAt: new Date(),
    },
  });

  // Create Cuisines
  const cuisines = await prisma.cuisine.createMany({
    data: [
      { Code: 'SRB', Name: 'Serbian' },
      { Code: 'MKD', Name: 'Macedonian' },
      { Code: 'HRV', Name: 'Croatian' },
    ],
  });

  // Associate Cuisines with Restaurant
  await prisma.restaurantCuisine.createMany({
    data: [
      { RestaurantId: restaurant.RestaurantId, CuisineId: 1 },
      { RestaurantId: restaurant.RestaurantId, CuisineId: 2 },
    ],
  });

  // Create Amenities
  const amenities = await prisma.amenity.createMany({
    data: [
      { Code: 'WIFI', Name: 'Free Wi-Fi' },
      { Code: 'PARK', Name: 'Parking Available' },
      { Code: 'OUTD', Name: 'Outdoor Seating' },
    ],
  });

  // Associate Amenities with Restaurant
  await prisma.restaurantAmenity.createMany({
    data: [
      { RestaurantId: restaurant.RestaurantId, AmenityId: 1 },
      { RestaurantId: restaurant.RestaurantId, AmenityId: 2 },
    ],
  });

  // Add Images to Restaurant
  await prisma.image.createMany({
    data: [
      {
        RestaurantId: restaurant.RestaurantId,
        Url: 'https://example.com/restaurant1.jpg',
      },
      {
        RestaurantId: restaurant.RestaurantId,
        Url: 'https://example.com/restaurant2.jpg',
      },
    ],
  });

  // Set Working Hours
  for (let day = 1; day <= 7; day++) {
    await prisma.workingHours.create({
      data: {
        RestaurantId: restaurant.RestaurantId,
        DayOfWeek: day,
        OpenTime: new Date('2025-01-01T08:00:00Z'),
        CloseTime: new Date('2025-01-01T22:00:00Z'),
        IsClosed: false,
      },
    });
  }

  // Create Review
  await prisma.review.create({
    data: {
      RestaurantId: restaurant.RestaurantId,
      UserId: normalUser.UserId,
      Rating: 5,
      Comment: 'Excellent food and cozy atmosphere!',
      IsEdited: false,
      StatusId: 1,
    },
  });

  // Add to Favorites
  await prisma.favorite.create({
    data: {
      UserId: normalUser.UserId,
      RestaurantId: restaurant.RestaurantId,
    },
  });

  console.log('✅ Database seeded successfully with realistic data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
