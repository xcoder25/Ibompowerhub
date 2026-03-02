// ─── Ibibio Language Dictionary ──────────────────────────────────────────────
// Tonal patterns: H = High, L = Low, D = Downstep, M = Mid
// Each syllable separated by '-'

export const IBIBIO_DICTIONARY = [
    // ─── Greetings & Common Expressions ───────────────────────────────────────
    { english: "Good morning", ibibio: "Emesiere", tones: "H-H-L", category: "greetings" },
    { english: "Good afternoon", ibibio: "Emesiere nsu afia", tones: "H-H-L L H-L", category: "greetings" },
    { english: "Good evening", ibibio: "Emesiere ekedong", tones: "H-H-L H-L-L", category: "greetings" },
    { english: "Good night", ibibio: "Emesiere ndok", tones: "H-H-L L", category: "greetings" },
    { english: "Welcome", ibibio: "Emedi", tones: "H-L", category: "greetings" },
    { english: "How are you?", ibibio: "Idem mfo?", tones: "H-H L", category: "greetings" },
    { english: "I am fine", ibibio: "Idem amesong", tones: "H-H L-H", category: "greetings" },
    { english: "Goodbye", ibibio: "Ka adi", tones: "L H", category: "greetings" },
    { english: "See you later", ibibio: "Mme fo akaba", tones: "H L H-L", category: "greetings" },
    { english: "How is your family?", ibibio: "Idem ayan mfo?", tones: "H-H H-L L", category: "greetings" },
    { english: "Good", ibibio: "Ama", tones: "H-L", category: "greetings" },
    { english: "Very good", ibibio: "Ama enye", tones: "H-L H-L", category: "greetings" },
    { english: "Yes", ibibio: "Ao", tones: "H", category: "greetings" },
    { english: "No", ibibio: "Dodo", tones: "H-L", category: "greetings" },
    { english: "Please", ibibio: "Ke sere", tones: "L H-L", category: "greetings" },
    { english: "Thank you", ibibio: "Sosongo", tones: "H-L-H", category: "greetings" },
    { english: "Thanks", ibibio: "Sosong", tones: "H-L", category: "greetings" },
    { english: "Sorry", ibibio: "Ndibi", tones: "L-H", category: "greetings" },
    { english: "I beg you", ibibio: "Mme ke oyom fo", tones: "H L H-L L", category: "greetings" },
    { english: "Excuse me", ibibio: "Ndibi ke fo", tones: "L-H L L", category: "greetings" },
    { english: "God bless you", ibibio: "Abasi odiong fi", tones: "H-L-H H-L L", category: "greetings" },
    { english: "Congratulations", ibibio: "Ememi owo", tones: "H-L-H H-L", category: "greetings" },
    { english: "Well done", ibibio: "Ememi", tones: "H-L-H", category: "greetings" },
    { english: "Come in", ibibio: "Kpem", tones: "L", category: "greetings" },
    { english: "Sit down", ibibio: "Bong", tones: "L", category: "greetings" },
    { english: "Stand up", ibibio: "Nyin", tones: "H", category: "greetings" },

    // ─── Personal Pronouns & Identity ─────────────────────────────────────────
    { english: "I", ibibio: "Mme", tones: "H", category: "pronouns" },
    { english: "You", ibibio: "Fo", tones: "L", category: "pronouns" },
    { english: "He", ibibio: "Enye", tones: "H-L", category: "pronouns" },
    { english: "She", ibibio: "Enye", tones: "H-L", category: "pronouns" },
    { english: "We", ibibio: "Nnyin", tones: "L-L", category: "pronouns" },
    { english: "They", ibibio: "Enye ama", tones: "H-L H-L", category: "pronouns" },
    { english: "My", ibibio: "Ami", tones: "H-L", category: "pronouns" },
    { english: "Your", ibibio: "Afon", tones: "H-L", category: "pronouns" },
    { english: "His", ibibio: "Anye", tones: "H-L", category: "pronouns" },
    { english: "Her", ibibio: "Anye", tones: "H-L", category: "pronouns" },
    { english: "Our", ibibio: "Nnyin emi", tones: "L-L H-L", category: "pronouns" },

    // ─── Questions ─────────────────────────────────────────────────────────────
    { english: "What is your name?", ibibio: "Nnyin mfo edi nso?", tones: "L-H L L L", category: "questions" },
    { english: "My name is", ibibio: "Nnyin ami edi", tones: "L-H H-L H-L", category: "questions" },
    { english: "Where are you from?", ibibio: "Fo kedi fii?", tones: "L H-L H", category: "questions" },
    { english: "How old are you?", ibibio: "Amaama mfo edi iso?", tones: "H-H-L L H L", category: "questions" },
    { english: "What do you want?", ibibio: "Fo ke emi fi?", tones: "L L H-L L", category: "questions" },
    { english: "Where are you going?", ibibio: "Fo kedi?", tones: "L H-L", category: "questions" },
    { english: "What is this?", ibibio: "Ami ama edi?", tones: "H-L H-L H-L", category: "questions" },
    { english: "How much is this?", ibibio: "Amaama iso ama?", tones: "H-H-L L H-L", category: "questions" },
    { english: "Can you help me?", ibibio: "Fo ima ke mme?", tones: "L H-L L H", category: "questions" },
    { english: "Do you understand?", ibibio: "Fo ima ama?", tones: "L H-L H-L", category: "questions" },
    { english: "I don't understand", ibibio: "Mme ima ke ama", tones: "H H-L L H-L", category: "questions" },
    { english: "I don't know", ibibio: "Mme idem ke", tones: "H H-H L", category: "questions" },

    // ─── Family & People ───────────────────────────────────────────────────────
    { english: "Mother", ibibio: "Eka", tones: "H-L", category: "family" },
    { english: "Father", ibibio: "Ete", tones: "H-L", category: "family" },
    { english: "Brother", ibibio: "Ubi", tones: "H-L", category: "family" },
    { english: "Sister", ibibio: "Mayen", tones: "H-L", category: "family" },
    { english: "Son", ibibio: "Emi ete", tones: "H-L H-L", category: "family" },
    { english: "Daughter", ibibio: "Emi eka", tones: "H-L H-L", category: "family" },
    { english: "Child", ibibio: "Emi", tones: "H-L", category: "family" },
    { english: "Children", ibibio: "Emi ama", tones: "H-L H-L", category: "family" },
    { english: "Husband", ibibio: "Ete ufok", tones: "H-L H-L", category: "family" },
    { english: "Wife", ibibio: "Eka ufok", tones: "H-L H-L", category: "family" },
    { english: "Grandfather", ibibio: "Nna", tones: "H", category: "family" },
    { english: "Grandmother", ibibio: "Eka nna", tones: "H-L H", category: "family" },
    { english: "Uncle", ibibio: "Ete ete", tones: "H-L H-L", category: "family" },
    { english: "Aunt", ibibio: "Eka eka", tones: "H-L H-L", category: "family" },
    { english: "Friend", ibibio: "Ufan", tones: "H-L", category: "family" },
    { english: "Neighbour", ibibio: "Udi afiong", tones: "H-L H-L", category: "family" },
    { english: "Person", ibibio: "Owo", tones: "H-L", category: "family" },
    { english: "People", ibibio: "Owo ama", tones: "H-L H-L", category: "family" },
    { english: "King", ibibio: "Edidem", tones: "H-L-L", category: "family" },
    { english: "Chief", ibibio: "Obo", tones: "H-L", category: "family" },
    { english: "Elder", ibibio: "Inyene", tones: "H-L-L", category: "family" },
    { english: "Baby", ibibio: "Emi eket", tones: "H-L H-L", category: "family" },
    { english: "Girl", ibibio: "Mboho", tones: "L-H-L", category: "family" },
    { english: "Boy", ibibio: "Mkparawa", tones: "L-H-H-L", category: "family" },
    { english: "Man", ibibio: "Owo", tones: "H-L", category: "family" },
    { english: "Woman", ibibio: "Adiaha", tones: "H-H-L", category: "family" },

    // ─── Body Parts ────────────────────────────────────────────────────────────
    { english: "Head", ibibio: "Ebon", tones: "H-L", category: "body" },
    { english: "Eye", ibibio: "Inyin", tones: "H-L", category: "body" },
    { english: "Eyes", ibibio: "Inyin ama", tones: "H-L H-L", category: "body" },
    { english: "Ear", ibibio: "Nte", tones: "L", category: "body" },
    { english: "Nose", ibibio: "Ikong", tones: "H-L", category: "body" },
    { english: "Mouth", ibibio: "Ono", tones: "H-L", category: "body" },
    { english: "Teeth", ibibio: "Nkwa", tones: "L", category: "body" },
    { english: "Tongue", ibibio: "Etok", tones: "H-L", category: "body" },
    { english: "Neck", ibibio: "Enyene", tones: "H-L-L", category: "body" },
    { english: "Shoulder", ibibio: "Ikot", tones: "H-L", category: "body" },
    { english: "Hand", ibibio: "Owo", tones: "H-L", category: "body" },
    { english: "Finger", ibibio: "Ekondo owo", tones: "H-H-L H-L", category: "body" },
    { english: "Leg", ibibio: "Afid", tones: "H-L", category: "body" },
    { english: "Foot", ibibio: "Eket", tones: "H-L", category: "body" },
    { english: "Stomach", ibibio: "Akpa", tones: "H-L", category: "body" },
    { english: "Back", ibibio: "Kiet", tones: "H-L", category: "body" },
    { english: "Heart", ibibio: "Atop", tones: "H-L", category: "body" },
    { english: "Blood", ibibio: "Onon", tones: "H-L", category: "body" },
    { english: "Bone", ibibio: "Awat", tones: "H-L", category: "body" },
    { english: "Skin", ibibio: "Ikpa", tones: "H-L", category: "body" },
    { english: "Hair", ibibio: "Utong", tones: "H-L", category: "body" },

    // ─── Nature & Environment ──────────────────────────────────────────────────
    { english: "Water", ibibio: "Mmung", tones: "H", category: "nature" },
    { english: "Fire", ibibio: "Ewet", tones: "H-L", category: "nature" },
    { english: "Earth", ibibio: "Ikpa ufok", tones: "H-L H-L", category: "nature" },
    { english: "Land", ibibio: "Isua", tones: "H-L", category: "nature" },
    { english: "Sun", ibibio: "Afiong", tones: "H-L", category: "nature" },
    { english: "Moon", ibibio: "Ngon", tones: "L", category: "nature" },
    { english: "Star", ibibio: "Ibok", tones: "H-L", category: "nature" },
    { english: "Sky", ibibio: "Idim", tones: "H-L", category: "nature" },
    { english: "Rain", ibibio: "Inyong", tones: "H-L", category: "nature" },
    { english: "Wind", ibibio: "Ete", tones: "H-L", category: "nature" },
    { english: "Cloud", ibibio: "Awuri idim", tones: "H-L H-L", category: "nature" },
    { english: "River", ibibio: "Ikpa mmung", tones: "H-L H", category: "nature" },
    { english: "Sea", ibibio: "Ikpa mmung esi", tones: "H-L H L", category: "nature" },
    { english: "Tree", ibibio: "Utom", tones: "H-L", category: "nature" },
    { english: "Leaf", ibibio: "Ekpat", tones: "H-L", category: "nature" },
    { english: "Flower", ibibio: "Ibok utom", tones: "H-L H-L", category: "nature" },
    { english: "Grass", ibibio: "Etim", tones: "H-L", category: "nature" },
    { english: "Mountain", ibibio: "Nkuk", tones: "H-L", category: "nature" },
    { english: "Stone", ibibio: "Nkwong", tones: "L", category: "nature" },
    { english: "Sand", ibibio: "Ifut", tones: "H-L", category: "nature" },
    { english: "Farm", ibibio: "Eka", tones: "H-L", category: "nature" },
    { english: "Bush", ibibio: "Ikot", tones: "H-L", category: "nature" },
    { english: "Forest", ibibio: "Ekpor ikot", tones: "H-L H-L", category: "nature" },

    // ─── Food & Drink ──────────────────────────────────────────────────────────
    { english: "Food", ibibio: "Udia", tones: "H-L", category: "food" },
    { english: "Eat", ibibio: "Di udia", tones: "L H-L", category: "food" },
    { english: "Drink", ibibio: "Nom mmung", tones: "L H", category: "food" },
    { english: "Rice", ibibio: "Uresi", tones: "H-L-H", category: "food" },
    { english: "Yam", ibibio: "Ikpong", tones: "H-L", category: "food" },
    { english: "Cassava", ibibio: "Itong", tones: "H-L", category: "food" },
    { english: "Fish", ibibio: "Iyak", tones: "H-L", category: "food" },
    { english: "Meat", ibibio: "Nnuk", tones: "L", category: "food" },
    { english: "Chicken", ibibio: "Ekong", tones: "H-L", category: "food" },
    { english: "Palm oil", ibibio: "Ubok uti", tones: "H-L H-L", category: "food" },
    { english: "Pepper", ibibio: "Nkong", tones: "L", category: "food" },
    { english: "Salt", ibibio: "Ndibi", tones: "L-H", category: "food" },
    { english: "Soup", ibibio: "Otoho", tones: "H-L-H", category: "food" },
    { english: "Bread", ibibio: "Edidi", tones: "H-L-H", category: "food" },
    { english: "Egg", ibibio: "Iyeyen", tones: "H-L-L", category: "food" },
    { english: "Milk", ibibio: "Mmung eka", tones: "H H-L", category: "food" },
    { english: "Fruit", ibibio: "Ibok utom", tones: "H-L H-L", category: "food" },
    { english: "Plantain", ibibio: "Ogede", tones: "H-L-L", category: "food" },
    { english: "Banana", ibibio: "Ogedeji", tones: "H-L-L-H", category: "food" },
    { english: "Coconut", ibibio: "Ekpo ngon", tones: "H-L L", category: "food" },
    { english: "Pot", ibibio: "Eto", tones: "H-L", category: "food" },
    { english: "Plate", ibibio: "Ubak", tones: "H-L", category: "food" },
    { english: "Cup", ibibio: "Ikot mmung", tones: "H-L H", category: "food" },
    { english: "Hunger", ibibio: "Isui", tones: "H-L", category: "food" },
    { english: "Thirst", ibibio: "Isui mmung", tones: "H-L H", category: "food" },
    { english: "I am hungry", ibibio: "Mme isui", tones: "H H-L", category: "food" },
    { english: "I am thirsty", ibibio: "Mme isui mmung", tones: "H H-L H", category: "food" },

    // ─── Numbers ───────────────────────────────────────────────────────────────
    { english: "One", ibibio: "Kiet", tones: "H-L", category: "numbers" },
    { english: "Two", ibibio: "Iba", tones: "H-L", category: "numbers" },
    { english: "Three", ibibio: "Ita", tones: "H-L", category: "numbers" },
    { english: "Four", ibibio: "Inan", tones: "H-L", category: "numbers" },
    { english: "Five", ibibio: "Itiit", tones: "H-H", category: "numbers" },
    { english: "Six", ibibio: "Itiuk", tones: "H-H", category: "numbers" },
    { english: "Seven", ibibio: "Itiomot", tones: "H-H-L", category: "numbers" },
    { english: "Eight", ibibio: "Ition", tones: "H-L", category: "numbers" },
    { english: "Nine", ibibio: "Otiwa", tones: "H-L-L", category: "numbers" },
    { english: "Ten", ibibio: "Duop", tones: "H-L", category: "numbers" },
    { english: "Twenty", ibibio: "Duop iba", tones: "H-L H-L", category: "numbers" },
    { english: "Hundred", ibibio: "Ikim", tones: "H-L", category: "numbers" },
    { english: "Thousand", ibibio: "Ikimi", tones: "H-L-H", category: "numbers" },
    { english: "First", ibibio: "Edi kiet", tones: "H-L H-L", category: "numbers" },
    { english: "Last", ibibio: "Asan", tones: "H-L", category: "numbers" },

    // ─── Time & Days ───────────────────────────────────────────────────────────
    { english: "Today", ibibio: "Nnyin ke", tones: "L-H L", category: "time" },
    { english: "Tomorrow", ibibio: "Nkpo", tones: "L", category: "time" },
    { english: "Yesterday", ibibio: "Nkpok", tones: "L", category: "time" },
    { english: "Morning", ibibio: "Emesiere", tones: "H-H-L", category: "time" },
    { english: "Afternoon", ibibio: "Nsu afia", tones: "L H-L", category: "time" },
    { english: "Evening", ibibio: "Ekedong", tones: "H-L-L", category: "time" },
    { english: "Night", ibibio: "Ndok", tones: "L", category: "time" },
    { english: "Day", ibibio: "Nkpon afiong", tones: "L H-L", category: "time" },
    { english: "Week", ibibio: "Nte nnyin", tones: "L L-H", category: "time" },
    { english: "Month", ibibio: "Ngon", tones: "L", category: "time" },
    { english: "Year", ibibio: "Ikpe", tones: "H-L", category: "time" },
    { english: "Now", ibibio: "Anan", tones: "H-L", category: "time" },
    { english: "Later", ibibio: "Akaba", tones: "H-L", category: "time" },
    { english: "Soon", ibibio: "Ke eke", tones: "L H-L", category: "time" },
    { english: "Always", ibibio: "Owong", tones: "H-L", category: "time" },
    { english: "Never", ibibio: "Ke owong", tones: "L H-L", category: "time" },
    { english: "Monday", ibibio: "Nkpon kiet", tones: "L H-L", category: "time" },
    { english: "Tuesday", ibibio: "Nkpon iba", tones: "L H-L", category: "time" },
    { english: "Wednesday", ibibio: "Nkpon ita", tones: "L H-L", category: "time" },
    { english: "Thursday", ibibio: "Nkpon inan", tones: "L H-L", category: "time" },
    { english: "Friday", ibibio: "Nkpon itiit", tones: "L H-H", category: "time" },
    { english: "Saturday", ibibio: "Nkpon itiuk", tones: "L H-H", category: "time" },
    { english: "Sunday", ibibio: "Nte", tones: "L", category: "time" },

    // ─── Places & Buildings ────────────────────────────────────────────────────
    { english: "House", ibibio: "Ufok", tones: "H-L", category: "places" },
    { english: "Home", ibibio: "Ufok ami", tones: "H-L H-L", category: "places" },
    { english: "Village", ibibio: "Idung", tones: "H-L", category: "places" },
    { english: "Town", ibibio: "Iko", tones: "H-L", category: "places" },
    { english: "City", ibibio: "Iko ibuot", tones: "H-L H-L", category: "places" },
    { english: "Market", ibibio: "Afia", tones: "H-L", category: "places" },
    { english: "Church", ibibio: "Ufok Abasi", tones: "H-L H-L", category: "places" },
    { english: "School", ibibio: "Ufok isip", tones: "H-L H-L", category: "places" },
    { english: "Hospital", ibibio: "Ufok ekong", tones: "H-L H-L", category: "places" },
    { english: "Farm", ibibio: "Eka isua", tones: "H-L H-L", category: "places" },
    { english: "Road", ibibio: "Iman", tones: "H-L", category: "places" },
    { english: "Bridge", ibibio: "Ukod", tones: "H-L", category: "places" },
    { english: "River", ibibio: "Ikpa mmung", tones: "H-L H", category: "places" },
    { english: "Well", ibibio: "Ubom mmung", tones: "H-L H", category: "places" },
    { english: "Heaven", ibibio: "Idim Abasi", tones: "H-L H-L", category: "places" },

    // ─── Actions & Verbs ───────────────────────────────────────────────────────
    { english: "Come", ibibio: "Kpem", tones: "L", category: "verbs" },
    { english: "Go", ibibio: "Ke", tones: "L", category: "verbs" },
    { english: "Run", ibibio: "Kiakpa", tones: "H-H-L", category: "verbs" },
    { english: "Walk", ibibio: "Ika", tones: "H-L", category: "verbs" },
    { english: "Sit", ibibio: "Bong", tones: "L", category: "verbs" },
    { english: "Stand", ibibio: "Nyin", tones: "H", category: "verbs" },
    { english: "Sleep", ibibio: "Kpukpot", tones: "H-L", category: "verbs" },
    { english: "Wake up", ibibio: "Emiet", tones: "H-L", category: "verbs" },
    { english: "Eat", ibibio: "Di", tones: "L", category: "verbs" },
    { english: "Drink", ibibio: "Nom", tones: "L", category: "verbs" },
    { english: "Cook", ibibio: "Kpon udia", tones: "L H-L", category: "verbs" },
    { english: "Wash", ibibio: "Udom", tones: "H-L", category: "verbs" },
    { english: "Bathe", ibibio: "Di mmung", tones: "L H", category: "verbs" },
    { english: "Cry", ibibio: "Kum", tones: "L", category: "verbs" },
    { english: "Laugh", ibibio: "Nkot", tones: "L", category: "verbs" },
    { english: "Talk", ibibio: "Ke eyen", tones: "L H-L", category: "verbs" },
    { english: "Listen", ibibio: "Odop", tones: "H-L", category: "verbs" },
    { english: "See", ibibio: "Kop", tones: "L", category: "verbs" },
    { english: "Hear", ibibio: "Odop", tones: "H-L", category: "verbs" },
    { english: "Give", ibibio: "Ma", tones: "L", category: "verbs" },
    { english: "Take", ibibio: "Ke", tones: "L", category: "verbs" },
    { english: "Buy", ibibio: "Den afia", tones: "L H-L", category: "verbs" },
    { english: "Sell", ibibio: "Ma ama afia", tones: "L H-L H-L", category: "verbs" },
    { english: "Work", ibibio: "Utom", tones: "H-L", category: "verbs" },
    { english: "Rest", ibibio: "Ke ekung", tones: "L H-L", category: "verbs" },
    { english: "Play", ibibio: "Nyuk", tones: "L", category: "verbs" },
    { english: "Fight", ibibio: "Owop", tones: "H-L", category: "verbs" },
    { english: "Love", ibibio: "Mma", tones: "H", category: "verbs" },
    { english: "Hate", ibibio: "Kpod", tones: "L", category: "verbs" },
    { english: "Know", ibibio: "Idem", tones: "H-H", category: "verbs" },
    { english: "Think", ibibio: "Eyen akama", tones: "H-L H-L", category: "verbs" },
    { english: "Remember", ibibio: "Etenyin", tones: "H-L-L", category: "verbs" },
    { english: "Forget", ibibio: "Idid", tones: "H-L", category: "verbs" },
    { english: "Cry", ibibio: "Ukut", tones: "H-L", category: "verbs" },
    { english: "Pray", ibibio: "Nkong Abasi", tones: "L H-L", category: "verbs" },
    { english: "Sing", ibibio: "Ke iton", tones: "L H-L", category: "verbs" },
    { english: "Dance", ibibio: "Ibom", tones: "H-L", category: "verbs" },
    { english: "Write", ibibio: "Ndise", tones: "L-H-L", category: "verbs" },
    { english: "Read", ibibio: "Ke isip", tones: "L H-L", category: "verbs" },
    { english: "Study", ibibio: "Isip", tones: "H-L", category: "verbs" },
    { english: "Build", ibibio: "Ke ufok", tones: "L H-L", category: "verbs" },
    { english: "Farm", ibibio: "Ka isua", tones: "L H-L", category: "verbs" },
    { english: "Fish", ibibio: "Ka iyak", tones: "L H-L", category: "verbs" },
    { english: "Hunt", ibibio: "Ka nnuk", tones: "L L", category: "verbs" },

    // ─── Emotions & States ─────────────────────────────────────────────────────
    { english: "Happy", ibibio: "Emen", tones: "H-L", category: "emotions" },
    { english: "Sad", ibibio: "Iwon atop", tones: "H-L H-L", category: "emotions" },
    { english: "Angry", ibibio: "Esit", tones: "H-L", category: "emotions" },
    { english: "Tired", ibibio: "Ikwo", tones: "H-L", category: "emotions" },
    { english: "Sick", ibibio: "Eka ekong", tones: "H-L H-L", category: "emotions" },
    { english: "Well", ibibio: "Amesong", tones: "H-L-L", category: "emotions" },
    { english: "Strong", ibibio: "Idim", tones: "H-L", category: "emotions" },
    { english: "Weak", ibibio: "Eto", tones: "H-L", category: "emotions" },
    { english: "Afraid", ibibio: "Uduak", tones: "H-L", category: "emotions" },
    { english: "Brave", ibibio: "Idim atop", tones: "H-L H-L", category: "emotions" },
    { english: "Love", ibibio: "Mma", tones: "H", category: "emotions" },
    { english: "Peace", ibibio: "Emen", tones: "H-L", category: "emotions" },
    { english: "Joy", ibibio: "Nko emen", tones: "L H-L", category: "emotions" },
    { english: "Pain", ibibio: "Owo akwa", tones: "H-L H-L", category: "emotions" },
    { english: "Hope", ibibio: "Etenyin", tones: "H-L-L", category: "emotions" },

    // ─── Colors ────────────────────────────────────────────────────────────────
    { english: "Red", ibibio: "Mbong", tones: "L", category: "colors" },
    { english: "White", ibibio: "Udat", tones: "H-L", category: "colors" },
    { english: "Black", ibibio: "Idiong", tones: "H-L", category: "colors" },
    { english: "Green", ibibio: "Ekpot", tones: "H-L", category: "colors" },
    { english: "Blue", ibibio: "Enim idim", tones: "H-L H-L", category: "colors" },
    { english: "Yellow", ibibio: "Ubok", tones: "H-L", category: "colors" },
    { english: "Brown", ibibio: "Nkpukpo", tones: "L-H-L", category: "colors" },

    // ─── Religion & Spirituality ───────────────────────────────────────────────
    { english: "God", ibibio: "Abasi", tones: "H-L", category: "religion" },
    { english: "Holy Spirit", ibibio: "Oro Abasi", tones: "H-L H-L", category: "religion" },
    { english: "Jesus", ibibio: "Yesu", tones: "H-L", category: "religion" },
    { english: "Prayer", ibibio: "Nkong", tones: "L", category: "religion" },
    { english: "Church", ibibio: "Ufok Abasi", tones: "H-L H-L", category: "religion" },
    { english: "Bless", ibibio: "Odiong", tones: "H-L", category: "religion" },
    { english: "Sin", ibibio: "Oto ekut", tones: "H-L H-L", category: "religion" },
    { english: "Heaven", ibibio: "Idim Abasi", tones: "H-L H-L", category: "religion" },
    { english: "Spirit", ibibio: "Oro", tones: "H-L", category: "religion" },
    { english: "Faith", ibibio: "Enye Abasi", tones: "H-L H-L", category: "religion" },
    { english: "Amen", ibibio: "Amia", tones: "H-L", category: "religion" },

    // ─── Animals ───────────────────────────────────────────────────────────────
    { english: "Dog", ibibio: "Ikot", tones: "H-L", category: "animals" },
    { english: "Cat", ibibio: "Ikot ndibi", tones: "H-L L-H", category: "animals" },
    { english: "Goat", ibibio: "Ewure", tones: "H-L-L", category: "animals" },
    { english: "Sheep", ibibio: "Nwan", tones: "L", category: "animals" },
    { english: "Cow", ibibio: "Anwan", tones: "H-L", category: "animals" },
    { english: "Pig", ibibio: "Eto okpo", tones: "H-L H-L", category: "animals" },
    { english: "Chicken", ibibio: "Ekong", tones: "H-L", category: "animals" },
    { english: "Cock", ibibio: "Ekong ete", tones: "H-L H-L", category: "animals" },
    { english: "Hen", ibibio: "Ekong eka", tones: "H-L H-L", category: "animals" },
    { english: "Bird", ibibio: "Anwan idim", tones: "H-L H-L", category: "animals" },
    { english: "Snake", ibibio: "Owo mmung", tones: "H-L H", category: "animals" },
    { english: "Fish", ibibio: "Iyak", tones: "H-L", category: "animals" },
    { english: "Mosquito", ibibio: "Inyon", tones: "H-L", category: "animals" },
    { english: "Ant", ibibio: "Ekpe eto", tones: "H-L H-L", category: "animals" },
    { english: "Elephant", ibibio: "Enin", tones: "H-L", category: "animals" },
    { english: "Lion", ibibio: "Ekpe", tones: "H-L", category: "animals" },
    { english: "Monkey", ibibio: "Ukpong", tones: "H-L", category: "animals" },

    // ─── Common Phrases ─────────────────────────────────────────────────────────
    { english: "I love you", ibibio: "Mma fi", tones: "H L", category: "phrases" },
    { english: "I miss you", ibibio: "Mme etenyin nso fo", tones: "H H-L-L L L", category: "phrases" },
    { english: "Be careful", ibibio: "Kama ke ebe", tones: "H-L L H-L", category: "phrases" },
    { english: "Well done", ibibio: "Ememi", tones: "H-L-H", category: "phrases" },
    { english: "Let us go", hibio: "Nnyin ke", tones: "L-H L", category: "phrases" },
    { english: "Let us eat", ibibio: "Nnyin di udia", tones: "L-H L H-L", category: "phrases" },
    { english: "Let us pray", ibibio: "Nnyin nkong Abasi", tones: "L-H L H-L", category: "phrases" },
    { english: "It is finished", ibibio: "Edi asan", tones: "H-L H-L", category: "phrases" },
    { english: "No problem", ibibio: "Ke ndibi", tones: "L L-H", category: "phrases" },
    { english: "What happened?", ibibio: "Ami akpa?", tones: "H-L H-L", category: "phrases" },
    { english: "I am coming", ibibio: "Mme kpem edi", tones: "H L H-L", category: "phrases" },
    { english: "Wait for me", ibibio: "Kama mme", tones: "H-L H", category: "phrases" },
    { english: "Follow me", ibibio: "Ke ema mme", tones: "L H-L H", category: "phrases" },
    { english: "It is okay", ibibio: "Ama edi", tones: "H-L H-L", category: "phrases" },
    { english: "May God help you", ibibio: "Abasi ima fo", tones: "H-L H-L L", category: "phrases" },

    // ─── Government & Civic Terms ──────────────────────────────────────────────
    { english: "Government", ibibio: "Edi isong", tones: "H-L H-L", category: "civic" },
    { english: "Law", ibibio: "Atan", tones: "H-L", category: "civic" },
    { english: "Justice", ibibio: "Ikpa owo", tones: "H-L H-L", category: "civic" },
    { english: "Peace", ibibio: "Emen", tones: "H-L", category: "civic" },
    { english: "Development", ibibio: "Edi ekelek", tones: "H-L H-L", category: "civic" },
    { english: "Progress", ibibio: "Ekelek", tones: "H-L", category: "civic" },
    { english: "Unity", ibibio: "Edi kiet", tones: "H-L H-L", category: "civic" },
    { english: "Community", ibibio: "Idung ama", tones: "H-L H-L", category: "civic" },
    { english: "Election", ibibio: "Ata owo", tones: "H-L H-L", category: "civic" },
    { english: "Rights", ibibio: "Ikpa owo", tones: "H-L H-L", category: "civic" },
    { english: "Leader", ibibio: "Owo edi isong", tones: "H-L H-L H-L", category: "civic" },
];

// ─── Search helper ────────────────────────────────────────────────────────────
export function findIbibioTranslation(englishPhrase: string): typeof IBIBIO_DICTIONARY[0] | null {
    const lower = englishPhrase.toLowerCase().trim();

    // 1. Exact match
    const exact = IBIBIO_DICTIONARY.find(p => p.english.toLowerCase() === lower);
    if (exact) return exact;

    // 2. Starts-with match
    const starts = IBIBIO_DICTIONARY.find(p => lower.startsWith(p.english.toLowerCase()));
    if (starts) return starts;

    // 3. Contains match (longest wins)
    const containing = IBIBIO_DICTIONARY
        .filter(p => lower.includes(p.english.toLowerCase()))
        .sort((a, b) => b.english.length - a.english.length);
    if (containing.length > 0) return containing[0];

    // 4. Word-by-word fuzzy — try every word
    const words = lower.split(/\s+/);
    for (const word of words) {
        const wordMatch = IBIBIO_DICTIONARY.find(p => p.english.toLowerCase() === word);
        if (wordMatch) return wordMatch;
    }

    return null;
}

// ─── Categories accessor ─────────────────────────────────────────────────────
export function getIbibioByCategory(category: string) {
    return IBIBIO_DICTIONARY.filter(p => p.category === category);
}

export const IBIBIO_CATEGORIES = [
    'greetings', 'pronouns', 'questions', 'family', 'body',
    'nature', 'food', 'numbers', 'time', 'places',
    'verbs', 'emotions', 'colors', 'religion', 'animals', 'phrases', 'civic'
];

export const DAILY_PROVERBS = [
    {
        local: "Owo akpa owo anwam.",
        english: "A person dies, but their help (influence) lives on.",
        meaning: "Legacy is defined by the kindness and support we give to others while alive.",
        language: "Ibibio"
    },
    {
        local: "Edu uwem owo edi owo.",
        english: "The character of a person defines the person.",
        meaning: "Your reputation and true self are built on your daily actions and ethics.",
        language: "Efik"
    },
    {
        local: "Nnyin mmo edi nnyin.",
        english: "We are who we are.",
        meaning: "Identity and pride in one's roots is the foundation of community.",
        language: "Annang"
    },
    {
        local: "Ufan ke ufan edi idim.",
        english: "Friend of a friend is a river.",
        meaning: "Relationships run deep and flow far when maintained with sincerity.",
        language: "Ibibio"
    },
    {
        local: "Owo ke utom owo, enye kedidem.",
        english: "A person who works hard becomes a leader.",
        meaning: "Diligence and perseverance are the paths to greatness.",
        language: "Ibibio"
    },
    {
        local: "Ikot ke ikot edi ufok.",
        english: "One tree does not make a forest.",
        meaning: "Community strength comes from unity, not individuality.",
        language: "Ibibio"
    },
    {
        local: "Ke mma owo edi owo mma.",
        english: "Love a person and they will love you back.",
        meaning: "Kindness and love are always reciprocated in time.",
        language: "Ibibio"
    },
    {
        local: "Abasi edi Abasi, owo edi owo.",
        english: "God is God, a person is a person.",
        meaning: "Humility before God is the greatest virtue. No person should act as God.",
        language: "Ibibio"
    },
    {
        local: "Mmung ke ufok ke ufok.",
        english: "Water finds its way home eventually.",
        meaning: "Truth and justice will always prevail, no matter how long it takes.",
        language: "Ibibio"
    },
    {
        local: "Eyen ekot enye utom.",
        english: "The wise person chooses their work carefully.",
        meaning: "Wisdom means aligning your efforts with your gifts and calling.",
        language: "Ibibio"
    },
];
