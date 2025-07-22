
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const emojiCategories = {
  'Rostos': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
  'Gestos': ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'],
  'Corações': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  'Objetos': ['📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📞', '☎️', '📟', '📠', '📺', '📻'],
  'Símbolos': ['⭐', '🌟', '✨', '💫', '🔥', '💯', '✅', '❌', '❗', '❓', '💤', '💢', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '🔔', '🔕']
};

export const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  const [activeCategory, setActiveCategory] = useState('Rostos');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {Object.keys(emojiCategories).map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "ghost"}
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        <div className="p-4 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-8 gap-2">
            {emojiCategories[activeCategory as keyof typeof emojiCategories].map((emoji, index) => (
              <button
                key={index}
                className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                onClick={() => onEmojiSelect(emoji)}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
