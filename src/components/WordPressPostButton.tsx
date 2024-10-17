import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface WordPressPostButtonProps {
  articleContent: string;
  articleId: string;
}

export function WordPressPostButton({ articleContent, articleId }: WordPressPostButtonProps) {
  const [isPosting, setIsPosting] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [hasWordPressAccount, setHasWordPressAccount] = useState(false);
  const { data: session } = useSession();
  const [articleTitle, setArticleTitle] = useState('Untitled Article');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    // Extract title from article content
    const titleMatch = articleContent.match(/<h1[^>]*>(.*?)<\/h1>/);
    if (titleMatch && titleMatch[1]) {
      setArticleTitle(titleMatch[1].trim());
    }

    // Check if the article has already been published
    checkPublishStatus();
    // Check if the user has a WordPress account
    checkWordPressAccount();
  }, [articleContent, articleId, session]);

  const stripDomain = (domain: string): string => {
    return domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
  };

  const checkPublishStatus = async () => {
    if (!session?.user?.email || !articleId) return;

    const { data, error } = await supabase
      .from('wordpress_posts')
      .select('*')
      .eq('user_email', session.user.email)
      .eq('article_id', articleId)
      .single();

    if (error) {
      // Error handling without console.log
    } else if (data) {
      setIsPublished(true);
    } else {
      setIsPublished(false);
    }
  };

  const checkWordPressAccount = async () => {
    if (!session?.user?.email) return;

    const { data, error } = await supabase
      .from('wordpress_connections')
      .select('*')
      .eq('user_email', session.user.email)
      .single();

    if (error) {
      // Error handling without console.log
      setHasWordPressAccount(false);
    } else if (data) {
      setHasWordPressAccount(true);
    } else {
      setHasWordPressAccount(false);
    }
  };

  const postToWordPress = async () => {
    if (!session?.user?.email || isPublished || !hasWordPressAccount) return;

    setIsPosting(true);

    try {
      // Fetch WordPress connection details
      const { data: wpConnection, error: wpError } = await supabase
        .from('wordpress_connections')
        .select('*')
        .eq('user_email', session.user.email)
        .single();

      if (wpError) throw wpError;

      if (!wpConnection) {
        alert('No WordPress connection found. Please set up your WordPress integration first.');
        return;
      }

      const { wordpress_domain, username, application_password } = wpConnection;

      // Strip the domain to ensure it's just the domain name
      const strippedDomain = stripDomain(wordpress_domain);

      // Prepare the post data
      const postData = {
        title: articleTitle,
        content: articleContent,
        status: 'publish'
      };

      // Construct the correct URL
      const url = new URL('/wp-json/wp/v2/posts', `https://${strippedDomain}`).toString();

      // Make the API call to WordPress
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(username + ':' + application_password)
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Save the publish status to Supabase
      const { error: insertError } = await supabase
        .from('wordpress_posts')
        .insert({
          user_email: session.user.email,
          wordpress_post_id: result.id.toString(),
          article_id: articleId,
          article_title: articleTitle
        });

      if (insertError) throw insertError;

      // Update the state immediately
      setIsPublished(true);
      
      // Open the success modal
      setIsSuccessModalOpen(true);
    } catch (error) {
      alert('Failed to post article to WordPress. Please check your connection details and try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <>
      <div
        role="menuitem"
        className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground ${isPublished || isPosting || !hasWordPressAccount ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent hover:text-accent-foreground'}`}
        onClick={isPublished || isPosting || !hasWordPressAccount ? undefined : postToWordPress}
        style={{ paddingLeft: '0px', paddingTop: '0px', paddingBottom: '0px' }}
      >
        <Send className="mr-2 h-4 w-4" />
        {isPublished ? 'Publisert på WordPress' : 
         !hasWordPressAccount ? 'Ingen WordPress-konto tilkoblet' :
         isPosting ? 'Publiserer...' : 'Publiser på WordPress'}
      </div>

      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-center text-gray-900 dark:text-white">
              Artikkelen ble publisert på WordPress
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsSuccessModalOpen(false)} className="w-full">
              Lukk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}