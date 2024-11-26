namespace server.src.Task3 {
    class Task3HintGenerator {
        public string[] GetHints(int taskVersion, int Count) {
            string loremipsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean id auctor tortor, vel maximus est. Mauris eu pellentesque purus. Mauris neque justo, finibus vitae nunc nec, facilisis bibendum purus. In pulvinar sapien ante, ac tincidunt quam ultrices nec. Sed feugiat libero nec lacus dignissim suscipit. Duis in purus in nisi vestibulum rutrum eget eget purus. Fusce luctus neque nec lorem sollicitudin, nec sollicitudin justo placerat. Morbi condimentum turpis risus. Ut leo erat, luctus eu arcu a, cursus eleifend felis.";
            string[] words = loremipsum.Split(' ');

            // convert door code into words
            string doorCode = GetDoorCode(taskVersion);
            Tuple<string, string>[] codeWords = new Tuple<string, string>[doorCode.Length];
            string[] numberWords = new[] {"one", "two", "three", "four", "five", "six", "seven", "eight", "nine"};
            for (int i = 0; i < doorCode.Length && i < 10; i++) {
                codeWords[i] = new Tuple<string, string>(numberWords[i], numberWords[doorCode[i] - '1']);
            }

            // insert door code words into hints
            var rand = new Random(taskVersion);
            string[] hints = new string[Count];
            for (int i = 0; i < Count; i++) {
                if (i < doorCode.Length) {
                    List<string> newWords = words.ToList();
                    newWords.Insert(rand.Next(words.Length / 2), codeWords[i].Item1);
                    newWords.Insert(words.Length / 2 + rand.Next(words.Length) / 2, codeWords[i].Item2);                    
                    hints[i] = string.Join(' ', newWords);
                } else {
                    hints[i] = loremipsum;
                }
            }

            return hints;
        }
        public string GetDoorCode(int taskVersion) {
            string[] codes = {"123", "1221", "333", "1112", "1233", "3321", "1321", "2312", "1231", "2121"};
            System.Console.WriteLine($"Secret door code: {codes[Math.Abs(taskVersion) % codes.Length]}");
            return codes[Math.Abs(taskVersion) % codes.Length];
        }
        public int GenerateTaskVersion() {
            return new Random().Next(1000);
        }
    }
}