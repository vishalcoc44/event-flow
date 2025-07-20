# Social Features Test Guide

## 🎯 **What's Been Added**

### 1. **Navigation Updates**
- ✅ **Header Navigation**: Added "Social" link in the main navigation for customers
- ✅ **Mobile Menu**: Added "Social" link in mobile navigation
- ✅ **Dashboard Integration**: Added social section to customer dashboard

### 2. **Database Schema**
- ✅ **Follows Table**: Created with proper structure and foreign keys
- ✅ **Follower Counts**: Added to users, events, and categories tables
- ✅ **RLS Policies**: Set up for secure access control
- ✅ **Triggers**: Automatic follower count updates

### 3. **UI Components**
- ✅ **FollowButton**: Reusable component for following users, events, and categories
- ✅ **SocialProfile**: User profile display with follower counts
- ✅ **Social Dashboard**: Complete social page with tabs
- ✅ **Event Integration**: Follow buttons on event cards

## 🧪 **How to Test**

### **Step 1: Run Database Migration**
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run the contents of `add-social-features.sql`
3. Run the contents of `verify-social-setup.sql` to confirm setup

### **Step 2: Test Navigation**
1. **Login as a customer**
2. **Check Header**: You should see "Social" in the navigation
3. **Check Mobile**: Open mobile menu, "Social" should be there
4. **Check Dashboard**: Visit `/customer/dashboard`, you should see:
   - Social button in the header
   - Social Features section with 3 cards

### **Step 3: Test Social Page**
1. **Visit `/social`** - Should load the social dashboard
2. **Check Tabs**: Should have 4 tabs: Profile, Following, Events, Categories
3. **Profile Tab**: Should show your profile with follower counts
4. **Following Tab**: Should show who you follow and your followers
5. **Events Tab**: Should show events with follow buttons
6. **Categories Tab**: Should show categories with follow buttons

### **Step 4: Test Follow Functionality**
1. **Follow an Event**:
   - Go to `/events` page
   - Click "Follow" on any event
   - Check that the button changes to "Unfollow"
   - Check that follower count increases

2. **Follow a User**:
   - Go to `/social` page
   - In the Events or Categories tab, find a user
   - Click "Follow" on their profile
   - Check that the button changes to "Unfollow"

3. **Follow a Category**:
   - Go to `/social` page
   - Go to Categories tab
   - Click "Follow" on any category
   - Check that the button changes to "Unfollow"

### **Step 5: Test Real-time Updates**
1. **Open two browser windows**
2. **Login as different users**
3. **Follow each other**
4. **Check that follower counts update in real-time**

## 🔧 **Troubleshooting**

### **If Social Link Doesn't Appear**
- Check that you're logged in as a customer (role: 'USER' or 'customer')
- Check browser console for errors
- Verify that Header component is updated

### **If Social Page Doesn't Load**
- Check browser console for errors
- Verify that all components exist:
  - `SocialContext.tsx`
  - `SocialProfile.tsx`
  - `FollowButton.tsx`
  - `tabs.tsx`

### **If Follow Buttons Don't Work**
- Check browser console for API errors
- Verify database migration was successful
- Check that RLS policies are set up correctly

### **If Follower Counts Don't Update**
- Check that triggers are created
- Verify that `update_follower_count` function exists
- Check database logs for trigger errors

## 📊 **Expected Results**

After successful setup, you should see:

1. **Navigation**: "Social" link in header and mobile menu
2. **Dashboard**: Social section with 3 feature cards
3. **Social Page**: Complete dashboard with 4 tabs
4. **Event Cards**: Follow buttons on all events
5. **Real-time Updates**: Follower counts update automatically
6. **User Profiles**: Follower/following counts displayed

## 🎉 **Success Indicators**

- ✅ Social link appears in navigation
- ✅ Social page loads without errors
- ✅ Follow buttons work and update counts
- ✅ Real-time updates work
- ✅ No console errors
- ✅ Database queries return expected results 