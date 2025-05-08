import React from "react";

export default function HomePage() {
    return (
        <div className="bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 mb-8 md:mb-0">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Empowering Education Through Technology
                        </h1>
                        <p className="text-xl mb-6 text-blue-100">
                            Our integrated school management system connects students, teachers, and administrators
                            for a seamless educational experience.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button className="bg-white text-blue-700 font-medium px-6 py-2 rounded-md hover:bg-blue-50 transition-colors">
                                Get Started
                            </button>
                            <button className="border-2 border-white text-white font-medium px-6 py-2 rounded-md hover:bg-white hover:text-blue-700 transition-colors">
                                Learn More
                            </button>
                        </div>
                    </div>
                    <div className="md:w-1/2">
                        <img
                            src="../../../public/ecole.jpg"
                            alt="Students using digital platform"
                            className="rounded-lg shadow-xl"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-graduation-cap text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Student Portal</h3>
                            <p className="text-gray-600">
                                Access courses, assignments, grades, and communicate with teachers through a single dashboard.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-chalkboard-teacher text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Teacher Tools</h3>
                            <p className="text-gray-600">
                                Manage classes, create assignments, track attendance, and provide feedback to students efficiently.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-chart-line text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Administration</h3>
                            <p className="text-gray-600">
                                Streamline school operations with powerful tools for scheduling, reporting, and resource management.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="bg-white py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div>
                            <p className="text-4xl font-bold text-blue-600 mb-2">1,200+</p>
                            <p className="text-gray-600">Students</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-blue-600 mb-2">35+</p>
                            <p className="text-gray-600">Teachers</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-blue-600 mb-2">174+</p>
                            <p className="text-gray-600">Courses</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-blue-600 mb-2">98%</p>
                            <p className="text-gray-600">Success Rate</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">What People Say</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center mb-4">
                                <img
                                    src="../../../public/student.jpg"
                                    alt="Student profile"
                                    className="w-12 h-12 rounded-full mr-4"
                                />
                                <div>
                                    <h4 className="font-semibold">Salah Habras</h4>
                                    <p className="text-gray-600 text-sm">Student</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">
                                "The facilities are modern and well-equipped, and the student portal makes it easy to manage my courses and connect with faculty."
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center mb-4">
                                <img
                                    src="../../../public/teacher.jpg"
                                    alt="Teacher profile"
                                    className="w-12 h-12 rounded-full mr-4"
                                />
                                <div>
                                    <h4 className="font-semibold">Prof. Samir Allouani</h4>
                                    <p className="text-gray-600 text-sm">Teacher</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">
                                "As an educator, this system has significantly reduced my administrative workload, allowing me to focus more
                                on what truly matters - teaching and supporting my students."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-16 bg-white" id="about">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="md:w-1/2">
                            <img
                                src="../../../public/school-campus.jpg"
                                alt="Our school campus"
                                className="rounded-lg shadow-lg"
                            />
                        </div>
                        <div className="md:w-1/2">
                            <h2 className="text-3xl font-bold mb-6">About Our School</h2>
                            <p className="text-gray-600 mb-4">
                                Founded in 2005, our institution has been committed to providing quality education through innovative
                                teaching methods and cutting-edge technology. We believe in creating a nurturing environment where
                                students can thrive academically and personally.
                            </p>
                            <p className="text-gray-600 mb-4">
                                Our mission is to empower students with knowledge, skills, and values that will help them succeed in
                                an ever-changing global landscape. We aim to cultivate critical thinking, creativity, and a lifelong
                                love for learning.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* News and Events */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Latest News & Events</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <img
                                src="../../../public/event-1.jpg"
                                alt="Science fair"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <p className="text-sm text-gray-500 mb-2">May 2, 2025</p>
                                <h3 className="text-xl font-semibold mb-2">Hackathon Event</h3>
                                <p className="text-gray-600 mb-4">
                                    Students teamed up for 48 hours of coding, creativity, and competition.
                                    Innovative solutions to real-world problems were pitched to industry judges.
                                    The energy was electric, with mentorship, prizes, and nonstop collaboration.
                                </p>

                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <img
                                src="../../../public/event-2.jpg"
                                alt="Graduation ceremony"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <p className="text-sm text-gray-500 mb-2">July 15, 2025</p>
                                <h3 className="text-xl font-semibold mb-2">Graduation Ceremony</h3>
                                <p className="text-gray-600 mb-4">
                                    Graduates walked the stage in a proud, emotional celebration.
                                    Faculty, families, and friends gathered to honor their achievements.
                                    The event marked the start of new journeys beyond university walls.
                                </p>

                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <img
                                src="../../../public/event-3.jpg"
                                alt="Workshop"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <p className="text-sm text-gray-500 mb-2">March 28, 2025</p>
                                <h3 className="text-xl font-semibold mb-2">Chess Tournament</h3>
                                <p className="text-gray-600 mb-4">
                                    The university chess tournament drew players from all departments.
                                    Matches were intense, strategic, and showcased brilliant gameplay.
                                    Winners earned trophies, recognition, and a spot in the intercollegiate league.
                                </p>

                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-blue-700 text-white py-16">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h4 className="text-2xl font-bold mb-4">We’ve renewed our school and started a new chapter filled with ambition. We’ve brought in talented, dedicated engineers — are you ready to be one of them?
                    </h4>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-white" id="contact">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
                            <p className="text-gray-600 mb-6">
                                Have questions about our school or the platform? We're here to help.
                                Reach out to us through any of the following channels.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="bg-blue-100 text-blue-600 rounded-full p-2 mr-4">
                                        <i className="fas fa-map-marker-alt"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Address</h4>
                                        <p className="text-gray-600">123 Education Avenue, Knowledge City, 10001</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-blue-100 text-blue-600 rounded-full p-2 mr-4">
                                        <i className="fas fa-phone"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Phone</h4>
                                        <p className="text-gray-600">(123) 456-7890</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-blue-100 text-blue-600 rounded-full p-2 mr-4">
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Email</h4>
                                        <p className="text-gray-600">info@schoolmanagement.edu</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-blue-100 text-blue-600 rounded-full p-2 mr-4">
                                        <i className="fas fa-clock"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Office Hours</h4>
                                        <p className="text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h4 className="font-medium mb-2">Follow Us</h4>
                                <div className="flex space-x-4">
                                    <a href="#" className="bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 p-2 rounded-full transition-colors">
                                        <i className="fab fa-facebook-f"></i>
                                    </a>
                                    <a href="#" className="bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 p-2 rounded-full transition-colors">
                                        <i className="fab fa-twitter"></i>
                                    </a>
                                    <a href="#" className="bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 p-2 rounded-full transition-colors">
                                        <i className="fab fa-instagram"></i>
                                    </a>
                                    <a href="#" className="bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 p-2 rounded-full transition-colors">
                                        <i className="fab fa-linkedin-in"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div>
                            <form className="bg-gray-50 p-6 rounded-lg shadow-md">
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="What is this regarding?"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                                    <textarea
                                        id="message"
                                        rows="4"
                                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Your message here..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <div className="h-64 bg-gray-300 flex items-center justify-center text-gray-500">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13192.171285183218!2d-6.604380740583494!3d34.24745095516163!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda75981d7f4af7f%3A0x7c2f963603c5685d!2sSuperior%20School%20of%20Technology%20-%20Kenitra!5e0!3m2!1sen!2sma!4v1746726648411!5m2!1sen!2sma"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-md"
                ></iframe>
            </div>


            {/* FAQ Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-2">How do I create an account?</h3>
                            <p className="text-gray-600">
                                You don’t need to create an account yourself. Student accounts are provided directly by the school administration along with your login credentials.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-2">Is the platform accessible on mobile devices?</h3>
                            <p className="text-gray-600">
                                Yes, our school management system is fully responsive and works on desktops,
                                tablets, and smartphones. You can also download our mobile app for iOS and Android
                                for a more optimized experience.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-2">Can I chat with my classmates on the platform?</h3>
                            <p className="text-gray-600">
                                Currently, the platform does not support chatting between students. However, this feature is part of our development plan and will be available soon.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-2">Can I message my teacher on the platform?</h3>
                            <p className="text-gray-600">
                                Messaging teachers is not available at the moment, but its a planned feature that will be introduced in an upcoming update.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}