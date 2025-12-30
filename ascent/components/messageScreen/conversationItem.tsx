import { View, Text } from 'react-native'
import React from 'react'

interface Participants {
    user_id: string;
    username: string;
    full_name: string;
    profile_picture_url: string
}

interface LastMessage{
    message_id: string;
    content: string;
    sender_id: string;
    created_at: string;
}

interface ConversationItemProps{
    conversation_id: number;
    participants: [Participants];
    last_message: LastMessage;
    unread_count: number
}

const conversationItem = () => {
  return (
    <View>
      <Text>conversationItem</Text>
    </View>
  )
}

export default conversationItem