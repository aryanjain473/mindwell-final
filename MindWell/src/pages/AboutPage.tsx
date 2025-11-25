import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Award, Users, Heart, Lightbulb, GraduationCap, Globe, Code, Database, UserCheck, BookOpen, Brain, MessageCircle, Shield } from 'lucide-react';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Aryan Jain',
      role: 'Website & Integration',
      bio: 'Leads the design and development of the website interface. Implements user-friendly navigation, multilingual support, and responsive design. Works on integrating the chatbot into the website for seamless interaction.'
    },
    {
      name: 'Dhruv Saini',
      role: 'Chatbot Development',
      bio: 'Develops the AI-driven chatbot for text and voice-based mental health support. Focuses on natural language processing (NLP) and culturally adapted responses. Collaborates with Aryan to embed the chatbot within the platform.'
    },
    {
      name: 'Priyanshu Mishra',
      role: 'Research & Documentation',
      bio: 'Leads the research paper writing and ensures academic contribution. Works on collecting references, analyzing related work, and structuring the research output. Provides backend support in aligning chatbot responses with evidence-based frameworks.'
    }
  ];

  const guides = [
    {
      name: 'Prof. Sonia Joshi',
      role: 'Project Guide',
      bio: 'Mentoring our technical execution and academic depth'
    },
    {
      name: 'Prof. Kirti Sawlani',
      role: 'Co-Guide',
      bio: 'Providing guidance on project vision and implementation'
    }
  ];

  const visionGoals = [
    {
      icon: Globe,
      title: 'Break Cultural Barriers',
      description: 'Offering multilingual and culturally relevant support for diverse Indian communities'
    },
    {
      icon: GraduationCap,
      title: 'Address Academic Stress',
      description: 'Supporting students with academic challenges and mental health concerns'
    },
    {
      icon: Heart,
      title: 'Integrate Traditional Practices',
      description: 'Combining yoga and Ayurveda with modern AI-driven mental health tools'
    },
    {
      icon: MessageCircle,
      title: 'Accessible Communication',
      description: 'Providing voice and chat-based interaction for both rural and urban users'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Compassion First',
      description: 'Every feature is designed with empathy and understanding at its core'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Your mental health data is protected with the highest security standards'
    },
    {
      icon: Users,
      title: 'Inclusive Care',
      description: 'Mental health support that works for everyone, regardless of background'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Continuously advancing mental health technology with research-backed solutions'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Committed to providing the highest quality mental health support'
    },
    {
      icon: Target,
      title: 'Purpose-Driven',
      description: 'Every decision we make is guided by our mission to improve mental wellbeing'
    }
  ];

  return (
    <div className="min-h-screen py-20">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 mb-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              🌐
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              At MindWell AI, we are a team of passionate final-year engineering students working towards creating a meaningful impact in the field of mental health and technology. Our mission is to build an accessible, reliable, and culturally adapted platform that supports mental well-being for diverse communities across India.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-4 sm:px-6 lg:px-8 mb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              👨‍💻 Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Together, we bring expertise in full-stack web development, artificial intelligence, and user-centric design to craft a solution that is both innovative and impactful.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all group text-center h-full"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-primary-600 font-medium mb-4 text-lg">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed text-left">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guides Section */}
      <section className="px-4 sm:px-6 lg:px-8 mb-20 bg-gradient-to-r from-primary-50 to-secondary-50 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🎓 Our Guides
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We are grateful for the constant support and guidance of our mentors. Their mentorship has been instrumental in shaping the vision, technical execution, and academic depth of this project.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {guides.map((guide, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all group text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">{guide.name}</h3>
                <p className="text-primary-600 font-medium mb-3 text-lg">{guide.role}</p>
                <p className="text-gray-600 leading-relaxed">{guide.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Goals */}
      <section className="px-4 sm:px-6 lg:px-8 mb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🌱 Our Vision
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Mental health is often overlooked, especially in the Indian context. With MindWell AI, we aim to:
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {visionGoals.map((goal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow group"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl group-hover:scale-110 transition-transform">
                    <goal.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">{goal.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{goal.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Drives Us Section */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              💡 What Drives Us
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              We believe technology should serve humanity. With this project, we aspire to contribute towards a healthier, more aware, and more connected society.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-primary-600 rounded-full font-semibold text-lg hover:bg-gray-50 transition-colors"
              >
                Start Your Journey
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;