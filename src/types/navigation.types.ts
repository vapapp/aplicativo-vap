export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  
  // Main Stack
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  
  // Child Management
  ChildList: undefined;
  AddChild: undefined;
  EditChild: { childId: string };
  
  // Calculator
  Calculator: undefined;
  CalculatorResult: { result: any };
  
  // Videos
  VideoList: undefined;
  VideoPlayer: { videoId: string };
  
  // Quiz
  QuizList: undefined;
  Quiz: { quizId: string };
  QuizResult: { quizId: string; score: number };
  
  // Marketplace
  Marketplace: undefined;
  ProductDetails: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
  
  // Community
  Community: undefined;
  CreatePost: undefined;
  PostDetails: { postId: string };
  
  // SAC
  SupportCenter: undefined;
  CreateTicket: undefined;
  TicketDetails: { ticketId: string };
  
  // AI Assistant
  AIAssistant: undefined;
  
  // Ebooks
  EbookList: undefined;
  EbookReader: { ebookId: string };
};