import { system, world } from "@minecraft/server";

const stripColourCodes = (text) => {
  return text.replace(/§[0-9a-fklmnor]/gi, "");
};

system.runInterval(() => {
  [...world.getPlayers()].forEach((player) => {
    if (player.hasTag("test")) {
      var welcomeText = "This is a §l§bTEST§r §fmessage. Thank you for downloading my pack!\n\nTo change what this says, open your §7'§escripts§7' §ffolder\nand change the §7'§dwelcomeText§7' §fstring to whatever you want and try again.";
      var strippedText = stripColourCodes(welcomeText);

      if (player.getDynamicProperty("letterProcess") < strippedText.length) {
        player.setDynamicProperty("letterProcess", player.getDynamicProperty("letterProcess") + 1);
        player.playSound("random.click", { pitch: 1.5, volume: 1.0 });
      }

      try {
        let displayText = "";
        let visibleCharCount = 0;

        for (let i = 0; i < welcomeText.length; i++) {
          if (welcomeText[i] === '§' && i + 1 < welcomeText.length) {
            displayText += welcomeText[i];
            displayText += welcomeText[i + 1];

            i++;
          } else {
            if (visibleCharCount < player.getDynamicProperty("letterProcess")) {
              displayText += welcomeText[i];

              visibleCharCount++;
            } else break;
          }
        }

        player.onScreenDisplay.setActionBar(displayText);
      } catch (error) {
        console.warn(error);
      }

      const scheduleId = system.runTimeout(() => {
        system.clearRun(scheduleId);

        player.removeTag("test");
        player.setDynamicProperty("letterProcess", 0);

      }, welcomeText.length);
    }
  });
}, 0);
