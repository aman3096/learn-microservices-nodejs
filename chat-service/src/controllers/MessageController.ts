import { Request, Response } from "express";
import { AuthRequest } from '../middleware';
import { Message } from "../database";
import { ApiError, handleMessageReceived } from '../utils';

const send = async (request: AuthRequest, response: Response) => {
    try {

        const { receiverId, message } = request.body;
        const { _id, user, name } = request.user;

        validateReceiver(_id, receiverId);

        const newMessage = await Message.create({
            senderId: _id,
            receiverId,
            message,
        });

        // await handleMessageReceived(name, email, receiverId, message);

        return response.json({
            status: 200,
            message: "Message sent successfully!",
            data: newMessage,
        });

    } catch(err: any) {
        console.error(err);
        return response.json({
                status: 500,
                message: err.message,
            });

    }
}

const validateReceiver = (senderId: string, receiverId: string) => {
    if (!receiverId) {
        throw new ApiError(404, "Receiver ID is required.");
    }

    if (senderId == receiverId) {
        throw new ApiError(400, "Sender and receiver cannot be the same.");
    }
};


const getConversation = (req: Request, res: Response) => {
    try {

        const { receiverId } = req.params;
        const senderId = req.user._id,

        const messages = await Message.find({
            $or: [
                { senderId: receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        })

        return res.json({
            status: 200,
            message: "Messages retrieved successfully",
            data: messages,
        })
    } catch(err: any) {
        return res.json({
            status: 500,
            message: err.message,
        })
    }
}

export default {
    send,
    getConversation,
}