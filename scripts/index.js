import { system, world } from "@minecraft/server";

let activeTexts = new Map(); // Keeps track of active text animations

/**
 * Removes color codes from the given text.
 * @param {string} text - The string from which color codes will be removed.
 * @returns {string} - The text without color codes.
 */
function stripColorCodes(text) {
  return text.replace(/§[0-9a-fklmnor]/gi, "");
}

/**
 * Displays text to a target player one character at a time.
 * @param {Object} target - The player to whom the text will be displayed.
 * @param {string} string - The text to display.
 * @param {number} speed - The update interval in ticks (higher number means slower text appearance).
 */
function animatedText(target, string, speed) {
  const strippedText = stripColorCodes(string);

  // Initialize or reset properties for the text display
  target.setDynamicProperty("letterProcess", 0);

  // Define the display logic
  const updateDisplay = () => {
    const letterProcess = target.getDynamicProperty("letterProcess") || 0;

    if (letterProcess < strippedText.length) {
      target.setDynamicProperty("letterProcess", letterProcess + 1);
      target.playSound("random.click", { pitch: 1.5, volume: 1.0 });
    } else {
      // Cleanup after displaying the text
      system.clearRun(activeTexts.get(target)); // Clear the interval

      target.setDynamicProperty("letterProcess", 0);

      activeTexts.delete(target); // Remove from active texts

      return;
    }

    let displayText = "";
    let visibleCharacterCount = 0;

    const characterLength = target.getDynamicProperty("letterProcess");

    for (let i = 0; i < string.length; i++) {
      if (string[i] === "§" && i + 1 < string.length) {
        displayText += string[i] + string[i + 1];

        i++; // Skip the next character as it's part of the color code
      } else {
        if (visibleCharacterCount < characterLength) {
          displayText += string[i];

          visibleCharacterCount++;
        } else {
          break;
        }
      }
    }

    target.onScreenDisplay.setActionBar(displayText);
  };

  // Start the interval and keep track of it
  const intervalId = system.runInterval(updateDisplay, speed); // Update every given amount of ticks

  activeTexts.set(target, intervalId); // Map target to its intervalId
}

// Subscribe to the event to start the animation when a block is broken
world.afterEvents.playerBreakBlock.subscribe((data) => {
  const { player } = data;

  // If there is already an animation running, clear it first
  if (activeTexts.has(player)) {
    system.clearRun(activeTexts.get(player));

    activeTexts.delete(player);
  }

  // Start a new animation with a speed parameter
  animatedText(player, "This is a §l§bTEST§r §fmessage. Thank you for downloading my pack!\n\nTo change what this says, open your §7'§escripts§7' §ffolder\nand change the §7'§dwelcomeText§7' §fstring to whatever you want and try again.", 2);
});
