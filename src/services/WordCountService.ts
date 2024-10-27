import { supabase } from '../lib/supabase';

export class WordCountService {
  private static instance: WordCountService;
  private userEmail: string | null = null;
  private wordsRemaining: number = 0;
  private plagiatChecksRemaining: number = 0;

  private constructor() {}

  public static getInstance(): WordCountService {
    if (!WordCountService.instance) {
      WordCountService.instance = new WordCountService();
    }
    return WordCountService.instance;
  }

  public async initializeUser(email: string): Promise<void> {
    this.userEmail = email;
    await this.fetchUserData();
  }

  private async fetchUserData(): Promise<void> {
    if (!this.userEmail) throw new Error('User not initialized');

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('words_remaining, plagiat_check_remaining')
      .eq('user_id', this.userEmail)
      .single();

    if (error) throw error;
    this.wordsRemaining = data.words_remaining;
    this.plagiatChecksRemaining = data.plagiat_check_remaining;
  }

  public async checkPlagiatAvailability(): Promise<boolean> {
    await this.fetchUserData(); // Refresh data
    return this.plagiatChecksRemaining > 0;
  }

  public async deductPlagiatCheck(): Promise<void> {
    if (!this.userEmail) throw new Error('User not initialized');

    const { error } = await supabase.rpc('deduct_plagiat_check', {
      p_user_id: this.userEmail,
    });

    if (error) {
      console.error('Error deducting plagiat check:', error);
      throw error;
    }

    await this.fetchUserData(); // Update local data
  }

  public getPlagiatChecksRemaining(): number {
    return this.plagiatChecksRemaining;
  }

  public async checkWordAvailability(wordCount: number): Promise<boolean> {
    await this.fetchUserData(); // Refresh word count
    return this.wordsRemaining >= wordCount;
  }

  public async deductWords(wordCount: number): Promise<void> {
    if (!this.userEmail) throw new Error('User not initialized');

    console.log(`Attempting to deduct ${wordCount} words for user ${this.userEmail}`);

    const { error } = await supabase.rpc('deduct_words', {
      p_user_id: this.userEmail,
      p_word_count: wordCount,
    });

    if (error) {
      console.error('Error deducting words:', error);
      throw error;
    }

    console.log(`Successfully deducted ${wordCount} words for user ${this.userEmail}`);

    await this.fetchUserData(); // Update local word count
  }

  public getWordsRemaining(): number {
    return this.wordsRemaining;
  }

  public async refreshAndGetWordsRemaining(): Promise<number> {
    await this.fetchUserData();
    return this.wordsRemaining;
  }
}
