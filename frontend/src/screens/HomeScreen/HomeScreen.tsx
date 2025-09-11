import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { HomeScreenNavigationProp } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';

// UI Components
import { SearchBar, FilterChips, HorizontalScroll, LogoutModal } from '../../components/ui';

// Home Components
import {
  HomeHeader,
  DiscountBanner,
  ServiceGrid,
  ProfessionalCard,
  ProjectCard,
  PriceListCard,
} from '../../components/home';

// Layout Components
import { SectionHeader } from '../../components/layout';

// Mock Data
import { mockServices, mockProjects, mockProfessionals, mockDiscounts, mockFilters, mockBeforeAfterProject, mockReviews, mockPriceLists } from '../../data/mockData';

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [activeFilters, setActiveFilters] = useState(mockFilters || []);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout, user } = useAuth();

  const handleFilterChange = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleServicePress = (service: any) => {
    console.log('🎯 Service pressed:', service.title);
    console.log('🎯 Service object:', service);
    if (service.title === 'Batches') {
      console.log('🚀 Navigating to BatchesScreen...');
      try {
        navigation.navigate('BatchesScreen');
        console.log('✅ Navigation successful');
      } catch (error) {
        console.error('❌ Navigation error:', error);
        Alert.alert('Navigation Error', 'Failed to navigate to Batches screen');
      }
    }
  };

  const handleViewMorePress = () => {
    console.log('View more pressed');
  };

  const handleProjectPress = (project: any) => {
    console.log('Project pressed:', project.title);
  };

  const handleProfessionalPress = (professional: any) => {
    console.log('Professional pressed:', professional.name);
  };

  const handleLogout = () => {
    console.log('Logout button pressed');
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    console.log('Logout confirmed, starting logout process...');
    setIsLoggingOut(true);
    
    try {
      await logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutClose = () => {
    setShowLogoutModal(false);
    setIsLoggingOut(false);
  };

  const handlePriceListPress = (priceList: any) => {
    console.log('Price list pressed:', priceList.name);
  };

  // Filter professionals by type with fallback
  const mockProfessionalsSafe = mockProfessionals || [];
  const contractors = mockProfessionalsSafe.filter(p => p.type === 'contractor');
  const consultants = mockProfessionalsSafe.filter(p => p.type === 'consultant');
  const freelancers = mockProfessionals.filter(p => p.type === 'freelancer');
  const workshops = mockProfessionals.filter(p => p.type === 'workshop');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <HomeHeader
          location="Abu Dhabi"
          address="Street # 16, Al-bateen"
          onLocationPress={() => console.log('Location pressed')}
          onNotificationPress={() => console.log('Notification pressed')}
          onLogoutPress={handleLogout}
        />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          {SearchBar ? (
            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              onFilterPress={() => console.log('Filter pressed')}
            />
          ) : (
              <View style={styles.searchBarFallback}>
                <Text style={styles.searchBarText}>Search for services...</Text>
              </View>
            )}
        </View>

        {/* Filter Chips */}
        {activeFilters.length > 0 && FilterChips && (
          <FilterChips
            filters={activeFilters}

            
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onRemoveFilter={handleRemoveFilter}
            style={styles.filterChips}
          />
        )}

        {/* Services Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Services"
            onViewAllPress={() => console.log('View all services')}
          />
          <ServiceGrid
            services={mockServices}
            onServicePress={handleServicePress}
            onViewMorePress={handleViewMorePress}
          />
        </View>

        {/* Discounts Section */}
        <View style={styles.section}>
          <SectionHeader title="Discounts" showViewAll={false} />
          <DiscountBanner
            discount={mockDiscounts[0]}
            onPress={() => console.log('Discount pressed')}
          />
        </View>

        {/* Browse Design Projects Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Browse Design Projects"
            onViewAllPress={() => console.log('View all projects')}
          />
          <ScrollView
            contentContainerStyle={styles.horizontalScrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {mockProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onPress={() => handleProjectPress(project)}
                onHeartPress={() => console.log('Heart pressed')}
                onBookmarkPress={() => console.log('Bookmark pressed')}
                style={styles.projectCard}
              />
            ))}
          </ScrollView>
        </View>

        {/* Affiliate Program Section */}
        <View style={styles.section}>
          <SectionHeader title="Affiliate Program" showViewAll={false} />
          <View style={styles.affiliateCard}>
            <View style={styles.affiliateContent}>
              <Text style={styles.affiliateTitle}>Team Chat</Text>
              <Text style={styles.affiliateDescription}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </Text>
              <View style={styles.affiliateButton}>
                <Text style={styles.affiliateButtonText}>Join Now</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Seller Reviews Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Top Seller Reviews"
            onViewAllPress={() => console.log('View all reviews')}
          />
          <View style={styles.horizontalScrollContent}>
            {mockReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewImageContainer}>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>★ {review.rating}</Text>
                  </View>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓</Text>
                  </View>
                </View>
                <View style={styles.reviewContent}>
                  <Text style={styles.reviewCompany}>{review.company}</Text>
                  <Text style={styles.reviewLocation}>{review.location}</Text>
                  <Text style={styles.reviewQuote}>"{review.quote}"</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Find Professionals Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Find Professionals"
            subtitle="Connect with the best professionals who can provide unique services."
            showViewAll={false}
          />

          {/* Contractors */}
          <View style={styles.professionalSection}>
            <SectionHeader
              title="Contractors"
              subtitle="Find professional constructor companies."
              onViewAllPress={() => console.log('View all contractors')}
            />
            <View style={styles.horizontalScrollContent}>
              {contractors.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onPress={() => handleProfessionalPress(professional)}
                  style={styles.professionalCard}
                />
              ))}
            </View>
          </View>

          {/* Consultants */}
          <View style={styles.professionalSection}>
            <SectionHeader
              title="Consultants"
              subtitle="Expert consulting firm for your projects"
              onViewAllPress={() => console.log('View all consultants')}
            />
            <View style={styles.horizontalScrollContent}>
              {consultants.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onPress={() => handleProfessionalPress(professional)}
                  style={styles.professionalCard}
                />
              ))}
            </View>
          </View>

          {/* Suggested Work */}
          <View style={styles.professionalSection}>
            <SectionHeader
              title="Suggested Work"
              showViewAll={false}
            />
            <View style={styles.beforeAfterCard}>
              <View style={styles.beforeAfterContainer}>
                <View style={styles.beforeAfterImageContainer}>
                  <View style={styles.beforeImage}>
                    <Text style={styles.beforeAfterLabel}>Before</Text>
                  </View>
                  <View style={styles.afterImage}>
                    <Text style={styles.beforeAfterLabel}>After</Text>
                  </View>
                </View>
                <View style={styles.beforeAfterInfo}>
                  <View style={styles.companyLogo}>
                    <Text style={styles.companyLogoText}>GM</Text>
                  </View>
                  <View style={styles.companyInfo}>
                    <Text style={styles.companyName}>{mockBeforeAfterProject.company}</Text>
                    <Text style={styles.teamSize}>Team: {mockBeforeAfterProject.teamSize} people</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          
          

          {/* Freelancers */}
          <View style={styles.professionalSection}>
            <SectionHeader
              title="Freelancers"
              subtitle="Independent professionals for hire"
              onViewAllPress={() => console.log('View all freelancers')}
            />
            <View
              style={[styles.horizontalScrollContent, { width: '100%' }]}
            >
              {freelancers.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onPress={() => handleProfessionalPress(professional)}
                  style={styles.professionalCard}
                />
              ))}
            </View>
          </View>

          {/* Workshops */}
          <View style={styles.professionalSection}>
            <SectionHeader
              title="Workshops"
              subtitle="Connect with the best professionals for your construction projects."
              onViewAllPress={() => console.log('View all workshops')}
            />
            <View
              style={[styles.horizontalScrollContent, { width: '100%' }]}
            >
              {workshops.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onPress={() => handleProfessionalPress(professional)}
                  style={styles.professionalCard}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Price Lists Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Price Lists"
            subtitle="Manage and view your pricing strategies for different customer segments."
            onViewAllPress={() => navigation.navigate('PriceLists')}
          />
          <View style={styles.horizontalScrollContent}>
            {mockPriceLists.map((priceList) => (
              <PriceListCard
                key={priceList.id}
                priceList={priceList}
                onPress={() => handlePriceListPress(priceList)}
                style={styles.priceListCard}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <LogoutModal
        visible={showLogoutModal}
        isLoggingOut={isLoggingOut}
        onClose={handleLogoutClose}
        onConfirm={handleLogoutConfirm}
        username={user?.full_name || user?.email}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },

  section: {
    marginBottom: SPACING.xl,
  },
  horizontalScrollContent: {
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
  },
  projectCard: {
    marginRight: SPACING.md,
  },
  professionalCard: {
    marginRight: SPACING.md,
  },
  priceListCard: {
    marginRight: SPACING.md,
  },
  professionalSection: {
    marginBottom: SPACING.xl,
  },
  affiliateCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  affiliateContent: {
    alignItems: 'center',
  },
  affiliateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  affiliateDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  affiliateButton: {
    backgroundColor: COLORS.text.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  affiliateButtonText: {
    color: COLORS.text.light,
    fontWeight: '600',
  },
  reviewCard: {
    width: 280,
    height: 200,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  reviewImageContainer: {
    height: 120,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  ratingBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: COLORS.text.dark,
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.status.verified,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: COLORS.text.light,
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewContent: {
    padding: SPACING.md,
  },
  reviewCompany: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  reviewLocation: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  reviewQuote: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontStyle: 'italic',
  },
  beforeAfterCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  beforeAfterContainer: {
    padding: SPACING.md,
  },
  beforeAfterImageContainer: {
    flexDirection: 'row',
    height: 120,
    marginBottom: SPACING.md,
  },
  beforeImage: {
    flex: 1,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  afterImage: {
    flex: 1,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  beforeAfterLabel: {
    backgroundColor: COLORS.primary,
    color: COLORS.text.light,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  beforeAfterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  companyLogoText: {
    color: COLORS.text.light,
    fontWeight: 'bold',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  teamSize: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  horizontalScrollContainer: {
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    width: 1000, // Make it wider than screen to enable scrolling
  },
  // Fallback styles for missing components
  searchBarFallback: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginHorizontal: SPACING.lg,
  },
  searchBarText: {
    color: COLORS.text.secondary,
    fontSize: 16,
  },

});

export default HomeScreen;
