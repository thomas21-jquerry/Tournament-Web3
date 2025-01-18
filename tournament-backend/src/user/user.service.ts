import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { SiweMessage } from 'siwe';;
import { ethers } from 'ethers';
import { JwtService } from '@nestjs/jwt'; 
// import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(address: string, ): Promise<User> {
    const user = new this.userModel({ address });
    return await user.save();
  }

  async getUserByAddress(address: string): Promise<User> {
    return await this.userModel.findOne({ address }).exec();
  }

  async updateUser(address: string, name: string, email: string): Promise<User> {
    return await this.userModel
      .findOneAndUpdate({ address }, { name, email }, { new: true })
      .exec();
  }

  async verifyMessage(siweMessage: string, signature: string): Promise<boolean> {
    try {
      // Parse the SIWE message into a structured object
      const message = new SiweMessage(siweMessage);
      // Recover the address from the signature
      const recoveredAddress = ethers.verifyMessage(message.prepareMessage(), signature);
      // Compare the recovered address with the one in the SIWE message
      return recoveredAddress.toLowerCase() === message.address.toLowerCase();
    } catch (error) {
      console.error('Error verifying message', error);
      throw new Error('Invalid message or signature');
    }
  }
  
  async signIn(siweMessage: string, signature: string) {
    const isValid = await this.verifyMessage(siweMessage, signature);

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    const message = new SiweMessage(siweMessage);
    const address = message.address.toLowerCase();
    let user = await this.getUserByAddress(address);
    

    if (!user) {
      user = await this.createUser(address); // Create user if doesn't exist
    }

    const payload = { address: user.address };
    const token = this.jwtService.sign(payload);
    // Here you can create a session or JWT token and send it back to the client
    return { message: 'Signed in successfully', token };
  }
  
  async verifyAdmin(token: string): Promise<any>{

  }

  async verifyJwt(token: string): Promise<any> {
    try {
      // Verify the token using the JWT service
      const decoded = this.jwtService.verify(token);

      // If verification is successful, return the decoded token (payload)
      return decoded;
    } catch (error) {
      // If the token is invalid or expired, throw an exception
      throw new Error('Invalid or expired token');
    }
  }

  // async getNonce(request: Request) {
  //   const { searchParams } = new URL(request.url);
  //   const address = searchParams.get("address");
  
  //   if (!address) {
  //     throw new Error("Invalid address");
  //   }
  //   const nonce = randomBytes(16).toString("hex");
  //   addressMap.set(address, nonce);
  //   return Response.json({
  //     data: nonce,
  //   });


}
