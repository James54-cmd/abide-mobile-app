import { Dropdown } from "@/components/ui/Dropdown";
import { RenameConversationModal } from "./RenameConversationModal";
import type { Conversation } from "@/types";
import { Feather } from "@expo/vector-icons";
import { 
  Alert,
  Pressable,
  Text,
  View,
  StyleSheet
} from "react-native";
import { useState } from "react";

interface Props {
  visible: boolean;
  conversation: Conversation;
  anchor: { x: number; y: number; width: number; height: number } | null;
  onClose: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
}

/**
 * Context menu for conversation actions - follows SKILL.md Rule 7 (dumb component)
 * Props in, JSX out. No business logic or API calls.
 * Now uses proper dropdown positioning instead of centered modal.
 */
export function ConversationContextMenu({ 
  visible, 
  conversation,
  anchor,
  onClose, 
  onDelete, 
  onRename
}: Props) {
  const [showRenameModal, setShowRenameModal] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      "Delete Conversation",
      `Are you sure you want to delete "${conversation.title}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  const handleRename = () => {
    onClose();
    setShowRenameModal(true);
  };

  const handleRenameSubmit = (newTitle: string) => {
    setShowRenameModal(false);
    onRename(newTitle);
  };

  return (
    <>
      <Dropdown
        visible={visible}
        anchor={anchor}
        onClose={onClose}
        placement="bottom-right"
      >
        {/* Menu Items */}
        <View style={styles.menuContent}>
          {/* Rename Option */}
          <Pressable
            style={styles.menuItem}
            onPress={handleRename}
          >
            <Feather name="edit-2" size={18} color="#8C7B6A" />
            <Text style={styles.menuText}>Rename</Text>
          </Pressable>

          <View style={styles.separator} />

          {/* Delete Option */}
          <Pressable
            style={styles.menuItem}
            onPress={handleDelete}
          >
            <Feather name="trash-2" size={18} color="#DC2626" />
            <Text style={[styles.menuText, styles.deleteText]}>Delete</Text>
          </Pressable>
        </View>
      </Dropdown>

      {/* Rename Modal */}
      <RenameConversationModal
        visible={showRenameModal}
        currentTitle={conversation.title}
        onClose={() => setShowRenameModal(false)}
        onSave={handleRenameSubmit}
      />
    </>
  );
}

const styles = StyleSheet.create({
  menuContent: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  menuText: {
    fontSize: 16,
    color: "#433B32", // ink color
    marginLeft: 12,
    flex: 1,
  },
  deleteText: {
    color: "#DC2626",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(140, 123, 106, 0.2)", // muted with opacity
    marginHorizontal: 16,
  },
});