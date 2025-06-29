// import { NextResponse } from "next/server";
// import { databaseConnection } from "@/lib/db";
// import User from "@/models/User";
// import bcrypt from "bcryptjs";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../auth/[...nextauth]/route";

// export async function PUT(request) {
//   // Verify user session
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return NextResponse.json(
//       { success: false, message: "Unauthorized" },
//       { status: 401 }
//     );
//   }

//   try {
//     await databaseConnection();

//     const { firstName, lastName, phone, currentPassword, newPassword } =
//       await request.json();

//     // Get user from session instead of email
//     const user = await User.findById(session.user.id);
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Update basic info
//     user.firstName = firstName;
//     user.lastName = lastName;
//     user.phone = phone;

//     // Update password if provided
//     if (currentPassword && newPassword) {
//       const isMatch = await bcrypt.compare(currentPassword, user.password);
//       if (!isMatch) {
//         return NextResponse.json(
//           { success: false, message: "Current password is incorrect" },
//           { status: 400 }
//         );
//       }
//       user.password = await bcrypt.hash(newPassword, 12);
//     }

//     await user.save();

//     // Return updated user without sensitive data
//     const userData = {
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       phone: user.phone,
//       updatedAt: user.updatedAt,
//     };

//     return NextResponse.json({
//       success: true,
//       message: "Account updated successfully",
//       data: userData,
//     });
//   } catch (error) {
//     console.error("Account update error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Server error",
//         error:
//           process.env.NODE_ENV === "development" ? error.message : undefined,
//       },
//       { status: 500 }
//     );
//   }
// }
