'use server'
import { Avatars, Client, ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";
import { cookies } from "next/dist/server/request/cookies";
import { avatarPlaceholderURL } from "@/app/constants";
import { redirect } from "next/navigation";
import {fileTypeFromBuffer} from 'file-type'

const handleError = (error: unknown, message: string) => {
  console.error("Error:", message, error);
  throw new Error(message);
};
const client =new Client();
const avatars = new Avatars(client);




const getUserByEmail = async (email: string) => {
  try {
    const { databases } = await createAdminClient();
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("email", [email])]
    );
    return res.total > 0 ? res.documents[0] : null;
  } catch (error) {
    console.error("Failed to fetch user by email:", error);
    return null; // Graceful fallback
  }
};



export  const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();
  try {
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  } catch (error: any) {
    handleError(error, "Failed to send email OTP");
    return null; // Avoid breaking the flow
  }
};




export const createAccount = async ({
  fullname,
  email,
}: {
  fullname: string;
  email: string;
}) => {
  try {
    const exisitingUser = await getUserByEmail(email);
    const accountId = await sendEmailOTP({ email });
    if (!accountId) {
      throw new Error("Failed to send OTP");
    }

    if (!exisitingUser) {
      const names = fullname.split(" ");
      const firstName = names[0];
      const lastName = names[1] || ""; // Handle single-word names

      // Generate avatar URL
    
      
      const { databases } = await createAdminClient();
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        ID.unique(),
        {
          fullname,
          email,

          avatar: avatarPlaceholderURL,
          accountId,
        }
      );
    }
    

    return parseStringify({ accountId });
  } catch (error) {
    handleError(error, "Account creation failed");
  }
};
export const verifySecret=async({accountId,password}:{accountId:string,password:string})=>{
try {
  const {account}=await createAdminClient();

  const session =await account.createSession(accountId,password);
(await cookies()).set('appwrite-session',session.secret,{
  path:'/',
  httpOnly:true,
  sameSite:"strict",
  secure:true
})
return parseStringify({sessionId:session.$id})


} catch (error) {
  handleError(error,"Verification went wrong")
}
}


// Ensure Query is imported if not already

export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();
    const res = await account.get(); // Fetch account details
    
    // Query the database for user details
    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", res.$id)]
    );

    // If no user document exists, return null
    if (user.total === 0) {
      return null;
    }

    // Return parsed user details
    return parseStringify(user.documents[0]);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null; // Graceful handling in case of an error
  }
};


export const signOutUser = async () => {
  const { account } = await createSessionClient();

  try {
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in");
  }
};

export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

    // User exists, send OTP
    if (existingUser) {
      await sendEmailOTP({ email });
      return parseStringify({ accountId: existingUser.accountId });
    } 

  } catch (error) {
    
    handleError(error, "Failed to sign in user");
  }
};