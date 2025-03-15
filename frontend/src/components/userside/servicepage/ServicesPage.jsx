"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Navbar from "../Navbar"
import Footer from "../Footer"
import api from "../../../utils/axiosInterceptor"

const ServicesPage = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("userAccessToken")
        const response = await api.get("/api/services/", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        setServices(response.data)
      } catch (error) {
        console.error("Failed to load services.", error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-2">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 text-center mb-16">
            Discover our range of professional services tailored to your needs
          </p>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
  </div>
)

const ServiceCard = ({ service, navigate }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
    <div className="relative">
      {service.image && (
        <img src={`${api.defaults.baseURL}${service.image}`} alt={service.name} className="w-full h-40 object-cover" />
      )}
      <div className="absolute inset-0 bg-black bg-opacity-20 transition-opacity duration-300 opacity-0 hover:opacity-100 flex items-center justify-center">
        <button
          onClick={() => navigate(`/service/${service.id}`)}
          className="bg-white text-gray-900 font-semibold py-2 px-4 rounded-full hover:bg-gray-100 transition-colors duration-300"
        >
          View Details
        </button>
      </div>
    </div>
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
      <p className="text-gray-600 line-clamp-2">{service.description}</p>
    </div>
  </div>
)

export default ServicesPage