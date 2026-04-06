import { colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { 
  Modal, 
  Pressable, 
  Text, 
  View, 
  TextInput,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (newTitle: string) => void;
  currentTitle: string;
  isRenaming?: boolean;
}

/**
 * Modal for renaming conversations - follows SKILL.md Rule 7 (dumb component)
 * Props in, JSX out. No business logic or API calls.
 */
export function RenameConversationModal({ 
  visible, 
  onClose, 
  onSave,
  currentTitle,
  isRenaming = false
}: Props) {
  const [title, setTitle] = useState(currentTitle);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setTitle(currentTitle);
      setHasChanges(false);
    }
  }, [visible, currentTitle]);

  // Track changes
  useEffect(() => {
    setHasChanges(title.trim() !== currentTitle.trim() && title.trim().length > 0);
  }, [title, currentTitle]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle && trimmedTitle !== currentTitle.trim()) {
      onSave(trimmedTitle);
    }
  };

  const handleCancel = () => {
    setTitle(currentTitle);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.overlay} onPress={handleCancel}>
          <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Rename Conversation</Text>
              <Pressable onPress={handleCancel} style={styles.closeButton}>
                <Feather name="x" size={20} color={colors.muted} />
              </Pressable>
            </View>

            {/* Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Conversation Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter conversation title"
                placeholderTextColor={colors.muted + "80"}
                maxLength={100}
                autoFocus
                selectTextOnFocus
                editable={!isRenaming}
              />
              <View style={styles.inputFooter}>
                <Text style={styles.charCount}>
                  {title.length}/100
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable 
                style={[styles.button, styles.cancelButton]} 
                onPress={handleCancel}
                disabled={isRenaming}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable 
                style={[
                  styles.button, 
                  styles.saveButton,
                  (!hasChanges || isRenaming) && styles.saveButtonDisabled
                ]} 
                onPress={handleSave}
                disabled={!hasChanges || isRenaming}
              >
                {isRenaming ? (
                  <>
                    <Feather name="loader" size={16} color={colors.white} />
                    <Text style={styles.saveButtonText}>Saving...</Text>
                  </>
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: width * 0.9,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted + "20",
  },
  title: {
    fontFamily: "serif",
    fontSize: 18,
    fontWeight: "600",
    color: colors.ink,
  },
  closeButton: {
    padding: 4,
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  label: {
    fontFamily: "sans",
    fontSize: 14,
    fontWeight: "500",
    color: colors.ink,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.muted + "40",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: "sans",
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
  },
  charCount: {
    fontFamily: "sans",
    fontSize: 12,
    color: colors.muted,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  cancelButton: {
    backgroundColor: colors.muted + "15",
  },
  cancelButtonText: {
    fontFamily: "sans",
    fontSize: 16,
    fontWeight: "500",
    color: colors.muted,
  },
  saveButton: {
    backgroundColor: colors.gold,
  },
  saveButtonDisabled: {
    backgroundColor: colors.muted + "30",
  },
  saveButtonText: {
    fontFamily: "sans",
    fontSize: 16,
    fontWeight: "500",
    color: colors.white,
  },
});